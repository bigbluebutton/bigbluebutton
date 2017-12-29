/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.api;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.RegisteredUser;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.RedisStorageService;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.messages.CreateBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.CreateMeeting;
import org.bigbluebutton.api.messaging.messages.EndBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.EndMeeting;
import org.bigbluebutton.api.messaging.messages.GuestPolicyChanged;
import org.bigbluebutton.api.messaging.messages.GuestStatusChangedEventMsg;
import org.bigbluebutton.api.messaging.messages.GuestsStatus;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.bigbluebutton.api.messaging.messages.MeetingEnded;
import org.bigbluebutton.api.messaging.messages.MeetingStarted;
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken;
import org.bigbluebutton.api.messaging.messages.RecordChapterBreak;
import org.bigbluebutton.api.messaging.messages.RegisterUser;
import org.bigbluebutton.api.messaging.messages.UserJoined;
import org.bigbluebutton.api.messaging.messages.UserJoinedVoice;
import org.bigbluebutton.api.messaging.messages.UserLeft;
import org.bigbluebutton.api.messaging.messages.UserLeftVoice;
import org.bigbluebutton.api.messaging.messages.UserListeningOnly;
import org.bigbluebutton.api.messaging.messages.UserRoleChanged;
import org.bigbluebutton.api.messaging.messages.UserSharedWebcam;
import org.bigbluebutton.api.messaging.messages.UserStatusChanged;
import org.bigbluebutton.api.messaging.messages.UserUnsharedWebcam;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.PresentationUrlDownloadService;
import org.bigbluebutton.web.services.RegisteredUserCleanupTimerTask;
import org.bigbluebutton.web.services.turn.StunTurnService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class MeetingService implements MessageListener {
  private static Logger log = LoggerFactory.getLogger(MeetingService.class);

  private BlockingQueue<IMessage> receivedMessages = new LinkedBlockingQueue<IMessage>();
  private volatile boolean processMessage = false;

  private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
  private final Executor runExec = Executors.newSingleThreadExecutor();

  /**
   * http://ria101.wordpress.com/2011/12/12/concurrenthashmap-avoid-a-common-misuse/
   */
  private final ConcurrentMap<String, Meeting> meetings;
  private final ConcurrentMap<String, UserSession> sessions;

  private RecordingService recordingService;
  private RegisteredUserCleanupTimerTask registeredUserCleaner;
  private StunTurnService stunTurnService;
  private RedisStorageService storeService;

  private ParamsProcessorUtil paramsProcessorUtil;
  private PresentationUrlDownloadService presDownloadService;

  private IBbbWebApiGWApp gw;

  private  HashMap<String, PresentationUploadToken> uploadAuthzTokens;

  public MeetingService() {
    meetings = new ConcurrentHashMap<String, Meeting>(8, 0.9f, 1);
    sessions = new ConcurrentHashMap<String, UserSession>(8, 0.9f, 1);
    uploadAuthzTokens = new HashMap<String, PresentationUploadToken>();
  }

  public void addUserSession(String token, UserSession user) {
    sessions.put(token, user);
  }

  public void registerUser(String meetingID, String internalUserId,
                           String fullname, String role, String externUserID,
                           String authToken, String avatarURL, Boolean guest,
                           Boolean authed, String guestStatus) {
    handle(new RegisterUser(meetingID, internalUserId, fullname, role,
      externUserID, authToken, avatarURL, guest, authed, guestStatus));

    Meeting m = getMeeting(meetingID);
    if (m != null) {
      RegisteredUser ruser = new RegisteredUser(authToken, internalUserId, guestStatus);
      m.userRegistered(ruser);
    }
  }

  public UserSession getUserSessionWithUserId(String userId) {
    for (UserSession userSession : sessions.values()) {
      if (userSession.internalUserId.equals(userId)) {
        return userSession;
      }
    }

    return null;
  }

  public UserSession getUserSessionWithAuthToken(String token) {
    return sessions.get(token);
  }

  public UserSession removeUserSessionWithAuthToken(String token) {
    UserSession user = sessions.remove(token);
    if (user != null) {
      log.debug("Found user {} token={} to meeting {}", user.fullname, token, user.meetingID);
    }
    return user;
  }

  /**
   * Remove registered users who did not successfully joined the meeting.
   */
  public void purgeRegisteredUsers() {
    for (AbstractMap.Entry<String, Meeting> entry : this.meetings.entrySet()) {
      Long now = System.currentTimeMillis();
      Meeting meeting = entry.getValue();

      ConcurrentMap<String, User> users = meeting.getUsersMap();

      for (AbstractMap.Entry<String, RegisteredUser> registeredUser : meeting.getRegisteredUsers().entrySet()) {
        String registeredUserID = registeredUser.getKey();
        RegisteredUser registeredUserDate = registeredUser.getValue();

        long elapsedTime = now - registeredUserDate.registeredOn;
        if (elapsedTime >= 60000 && !users.containsKey(registeredUserID)) {
          meeting.userUnregistered(registeredUserID);
        }
      }
    }
  }

  private void kickOffProcessingOfRecording(Meeting m) {
    if (m.isRecord() && m.getNumUsers() == 0) {
      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", m.getInternalId());
      logData.put("externalMeetingId", m.getExternalId());
      logData.put("name", m.getName());
      logData.put("event", "kick_off_ingest_and_processing");
      logData.put("description", "Start processing of recording.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info("Initiate recording processing: data={}", logStr);

      processRecording(m.getInternalId());
    }
  }

  public Boolean authzTokenIsValid(String authzToken) { // Note we DO NOT expire the token
    return uploadAuthzTokens.containsKey(authzToken);
  }

  public Boolean authzTokenIsValidAndExpired(String authzToken) {  // Note we DO expire the token
    Boolean valid = uploadAuthzTokens.containsKey(authzToken);
    expirePresentationUploadToken(authzToken);
    return valid;
  }

  private void processMeetingForRemoval(Meeting m) {
    kickOffProcessingOfRecording(m);
    destroyMeeting(m.getInternalId());
    meetings.remove(m.getInternalId());
    removeUserSessions(m.getInternalId());
  }

  private void removeUserSessions(String meetingId) {
    Iterator<Map.Entry<String, UserSession>> iterator = sessions.entrySet().iterator();
    while (iterator.hasNext()) {
      Map.Entry<String, UserSession> entry = iterator.next();
      UserSession userSession = entry.getValue();

      if (userSession.meetingID.equals(meetingId)) {
        iterator.remove();
      }
    }
  }

  private void destroyMeeting(String meetingId) {
    gw.destroyMeeting(new DestroyMeetingMessage(meetingId));
  }

  public Collection<Meeting> getMeetings() {
    return meetings.isEmpty() ? Collections.<Meeting>emptySet()
      : Collections.unmodifiableCollection(meetings.values());
  }

  public Collection<UserSession> getSessions() {
    return sessions.isEmpty() ? Collections.<UserSession>emptySet()
      : Collections.unmodifiableCollection(sessions.values());
  }

  public synchronized boolean createMeeting(Meeting m) {
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(m.getExternalId());
    Meeting existing = getNotEndedMeetingWithId(internalMeetingId);
    if (existing == null) {
      meetings.put(m.getInternalId(), m);
      handle(new CreateMeeting(m));
      return true;
    }

    return false;
  }

  private void handleCreateMeeting(Meeting m) {
    if (m.isBreakout()) {
      Meeting parent = meetings.get(m.getParentMeetingId());
      parent.addBreakoutRoom(m.getExternalId());
      if (parent.isRecord()) {
        storeService.addBreakoutRoom(parent.getInternalId(), m.getInternalId());
      }
    }

    if (m.isRecord()) {
      Map<String, String> metadata = new TreeMap<>();
      metadata.putAll(m.getMetadata());
      // TODO: Need a better way to store these values for recordings
      metadata.put("meetingId", m.getExternalId());
      metadata.put("meetingName", m.getName());
      metadata.put("isBreakout", m.isBreakout().toString());

      storeService.recordMeetingInfo(m.getInternalId(), metadata);

      if (m.isBreakout()) {
        Map<String, String> breakoutMetadata = new TreeMap<>();
        breakoutMetadata.put("meetingId", m.getExternalId());
        breakoutMetadata.put("sequence", m.getSequence().toString());
        breakoutMetadata.put("parentMeetingId", m.getParentMeetingId());
        storeService.recordBreakoutInfo(m.getInternalId(), breakoutMetadata);
      }
    }

    Map<String, Object> logData = new HashMap<>();
    logData.put("meetingId", m.getInternalId());
    logData.put("externalMeetingId", m.getExternalId());
    if (m.isBreakout()) {
      logData.put("sequence", m.getSequence());
      logData.put("parentMeetingId", m.getParentMeetingId());
    }
    logData.put("name", m.getName());
    logData.put("duration", m.getDuration());
    logData.put("isBreakout", m.isBreakout());
    logData.put("record", m.isRecord());
    logData.put("event", "create_meeting");
    logData.put("description", "Create meeting.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);

    log.info("Create meeting: data={}", logStr);

    gw.createMeeting(m.getInternalId(), m.getExternalId(),
      m.getParentMeetingId(), m.getName(), m.isRecord(),
      m.getTelVoice(), m.getDuration(), m.getAutoStartRecording(),
      m.getAllowStartStopRecording(), m.getWebcamsOnlyForModerator(),
      m.getModeratorPassword(), m.getViewerPassword(),
      m.getCreateTime(), formatPrettyDate(m.getCreateTime()),
      m.isBreakout(), m.getSequence(), m.getMetadata(), m.getGuestPolicy(), m.getWelcomeMessageTemplate(),
      m.getWelcomeMessage(), m.getModeratorOnlyMessage(), m.getDialNumber(), m.getMaxUsers(),
      m.getMaxInactivityTimeoutMinutes(), m.getWarnMinutesBeforeMax(),
      m.getMeetingExpireIfNoUserJoinedInMinutes(), m.getmeetingExpireWhenLastUserLeftInMinutes());

  }

  private String formatPrettyDate(Long timestamp) {
    return new Date(timestamp).toString();
  }

  private void processCreateMeeting(CreateMeeting message) {
    handleCreateMeeting(message.meeting);
  }

  private void processRegisterUser(RegisterUser message) {
    Meeting m = getMeeting(message.meetingID);
    if (m != null) {
      User prevUser = m.getUserWithExternalId(message.externUserID);
      if (prevUser != null) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", m.getInternalId());
        logData.put("externalMeetingId", m.getExternalId());
        logData.put("name", m.getName());
        logData.put("extUserId", prevUser.getExternalUserId());
        logData.put("intUserId", prevUser.getInternalUserId());
        logData.put("username", prevUser.getFullname());
        logData.put("event", "duplicate_user_with_external_userid");
        logData.put("description", "Duplicate user with external userid.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.info("Duplicate user with same externalUserId: data={}", logStr);

        gw.ejectDuplicateUser(message.meetingID,
                prevUser.getInternalUserId(), prevUser.getFullname(),
                prevUser.getExternalUserId());
      }

    }
    gw.registerUser(message.meetingID,
      message.internalUserId, message.fullname, message.role,
      message.externUserID, message.authToken, message.avatarURL, message.guest,
            message.authed, message.guestStatus);
  }

  public Meeting getMeeting(String meetingId) {
    if (meetingId == null)
      return null;
    for (String key : meetings.keySet()) {
      if (key.startsWith(meetingId))
        return meetings.get(key);
    }

    return null;
  }

  public Collection<Meeting> getMeetingsWithId(String meetingId) {
    if (meetingId == null)
      return Collections.<Meeting>emptySet();

    Collection<Meeting> m = new HashSet<>();

    for (String key : meetings.keySet()) {
      if (key.startsWith(meetingId))
        m.add(meetings.get(key));
    }

    return m;
  }

  public Meeting getNotEndedMeetingWithId(String meetingId) {
    if (meetingId == null)
      return null;
    for (String key : meetings.keySet()) {
      if (key.startsWith(meetingId)) {
        Meeting m = meetings.get(key);
        if (!m.isForciblyEnded())
          return m;
      }
    }

    return null;
  }

  public String getRecordings2x(ArrayList<String> idList, ArrayList<String> states, Map<String, String> metadataFilters) {
    return recordingService.getRecordings2x(idList, states, metadataFilters);
  }

  private int getDurationRecording(String playbackDuration, String end,
                                   String start) {
    int duration;
    try {
      if (!"".equals(playbackDuration)) {
        duration = (int) Math
          .ceil((Long.parseLong(playbackDuration)) / 60000.0);
      } else {
        duration = (int) Math.ceil((Long.parseLong(end) - Long
          .parseLong(start)) / 60000.0);
      }
    } catch (Exception e) {
      log.debug(e.getMessage());
      duration = 0;
    }

    return duration;
  }

  public boolean existsAnyRecording(List<String> idList) {
    return recordingService.existAnyRecording(idList);
  }

  public void setPublishRecording(List<String> idList, boolean publish) {
    for (String id : idList) {
      if (publish) {
        recordingService.changeState(id, Recording.STATE_PUBLISHED);
      } else {
        recordingService.changeState(id, Recording.STATE_UNPUBLISHED);
      }
    }
  }

  public void deleteRecordings(List<String> idList) {
    for (String id : idList) {
      recordingService.changeState(id, Recording.STATE_DELETED);
    }
  }

  public void updateRecordings(List<String> idList, Map<String, String> metaParams) {
    recordingService.updateMetaParams(idList, metaParams);
  }



  public void processRecording(String meetingId) {
    recordingService.startIngestAndProcessing(meetingId);
  }

  public boolean isMeetingWithVoiceBridgeExist(String voiceBridge) {
        /*
         * Collection<Meeting> confs = meetings.values(); for (Meeting c :
         * confs) { if (voiceBridge == c.getVoiceBridge()) { return true; } }
         */
    return false;
  }


  public void endMeeting(String meetingId) {
    handle(new EndMeeting(meetingId));
  }

  private void processCreateBreakoutRoom(CreateBreakoutRoom message) {
    Meeting parentMeeting = getMeeting(message.parentMeetingId);
    if (parentMeeting != null) {

      Map<String, String> params = new HashMap<>();
      params.put("name", message.name);
      params.put("meetingID", message.meetingId);
      params.put("parentMeetingID", message.parentMeetingId);
      params.put("isBreakout", "true");
      params.put("sequence", message.sequence.toString());
      params.put("attendeePW", message.viewerPassword);
      params.put("moderatorPW", message.moderatorPassword);
      params.put("voiceBridge", message.voiceConfId);
      params.put("duration", message.durationInMinutes.toString());
      params.put("record", message.record.toString());
      params.put("welcome", getMeeting(message.parentMeetingId).getWelcomeMessageTemplate());

      Map<String, String> parentMeetingMetadata = parentMeeting.getMetadata();

      String metaPrefix = "meta_";
      for (String key : parentMeetingMetadata.keySet()) {
        String metaName = metaPrefix + key;
        // Inject metadata from parent meeting into the breakout room.
        params.put(metaName, parentMeetingMetadata.get(key));
      }

      Meeting breakout = paramsProcessorUtil.processCreateParams(params);

      createMeeting(breakout);

      presDownloadService.extractPresentationPage(message.parentMeetingId,
        message.sourcePresentationId,
        message.sourcePresentationSlide, breakout.getInternalId());
    } else {
      log.error(
        "Failed to create breakout room {}.Reason: Parent meeting {} not found.",
        message.meetingId, message.parentMeetingId);
    }
  }

  private void processEndBreakoutRoom(EndBreakoutRoom message) {
    processEndMeeting(new EndMeeting(message.breakoutMeetingId));
  }

  private void processEndMeeting(EndMeeting message) {
    gw.endMeeting(new EndMeetingMessage(message.meetingId));
  }

  private void processRemoveEndedMeeting(MeetingEnded message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      m.setForciblyEnded(true);
      processRecording(m.getInternalId());
      destroyMeeting(m.getInternalId());
      meetings.remove(m.getInternalId());
      removeUserSessions(m.getInternalId());
    }
  }

  private void processGuestStatusChangedEventMsg(GuestStatusChangedEventMsg message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      for (GuestsStatus guest : message.guests) {
        User user = m.getUserById(guest.userId);
        if (user != null) user.setGuestStatus(guest.status);
      }
    }

    for (GuestsStatus guest : message.guests) {
      UserSession userSession = getUserSessionWithUserId(guest.userId);
      if (userSession != null) userSession.guestStatus = guest.status;
    }

  }

  private void processPresentationUploadToken(PresentationUploadToken message) {
    uploadAuthzTokens.put(message.authzToken, message);
  }

  private void expirePresentationUploadToken(String usedToken) {
    uploadAuthzTokens.remove(usedToken);
  }

  public void addUserCustomData(String meetingId, String userID,
                                Map<String, String> userCustomData) {
    Meeting m = getMeeting(meetingId);
    if (m != null) {
      m.addUserCustomData(userID, userCustomData);
    }
  }

  private void meetingStarted(MeetingStarted message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      if (m.getStartTime() == 0) {
        long now = System.currentTimeMillis();
        m.setStartTime(now);

        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", m.getInternalId());
        logData.put("externalMeetingId", m.getExternalId());
        if (m.isBreakout()) {
          logData.put("parentMeetingId", m.getParentMeetingId());
        }
        logData.put("name", m.getName());
        logData.put("duration", m.getDuration());
        logData.put("record", m.isRecord());
        logData.put("isBreakout", m.isBreakout());
        logData.put("event", "meeting_started");
        logData.put("description", "Meeting has started.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info("Meeting started: data={}", logStr);
      } else {
        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", m.getInternalId());
        logData.put("externalMeetingId", m.getExternalId());
        if (m.isBreakout()) {
          logData.put("parentMeetingId", m.getParentMeetingId());
        }
        logData.put("name", m.getName());
        logData.put("duration", m.getDuration());
        logData.put("record", m.isRecord());
        logData.put("isBreakout", m.isBreakout());
        logData.put("event", "meeting_restarted");
        logData.put("description", "Meeting has restarted.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info("Meeting restarted: data={}", logStr);
      }
      return;
    }
  }

  private void meetingDestroyed(MeetingDestroyed message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      long now = System.currentTimeMillis();
      m.setEndTime(now);

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", m.getInternalId());
      logData.put("externalMeetingId", m.getExternalId());
      logData.put("name", m.getName());
      logData.put("duration", m.getDuration());
      logData.put("record", m.isRecord());
      logData.put("event", "meeting_destroyed");
      logData.put("description", "Meeting has been destroyed.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info("Meeting destroyed: data={}", logStr);

      return;
    }
  }

  private void meetingEnded(MeetingEnded message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      long now = System.currentTimeMillis();
      m.setEndTime(now);

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", m.getInternalId());
      logData.put("externalMeetingId", m.getExternalId());
      logData.put("name", m.getName());
      logData.put("duration", m.getDuration());
      logData.put("record", m.isRecord());
      logData.put("event", "meeting_destroyed");
      logData.put("description", "Meeting has been destroyed.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info("Meeting destroyed: data={}", logStr);

      processRemoveEndedMeeting(message);

      return;
    }
  }

  private void userJoined(UserJoined message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      if (m.getNumUsers() == 0) {
        // First user joins the meeting. Reset the end time to zero
        // in case the meeting has been rejoined.
        m.setEndTime(0);
      }

      User user = new User(message.userId, message.externalUserId,
        message.name, message.role, message.avatarURL, message.guest,
              message.guestStatus);
      m.userJoined(user);
      m.setGuestStatusWithId(user.getInternalUserId(), message.guestStatus);
      UserSession userSession = getUserSessionWithUserId(user.getInternalUserId());
      if (userSession != null) {
        userSession.guestStatus = message.guestStatus;
      }

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", m.getInternalId());
      logData.put("externalMeetingId", m.getExternalId());
      logData.put("name", m.getName());
      logData.put("userId", message.userId);
      logData.put("externalUserId", user.getExternalUserId());
      logData.put("username", user.getFullname());
      logData.put("role", user.getRole());
      logData.put("guest", user.isGuest());
      logData.put("guestStatus", user.getGuestStatus());
      logData.put("event", "user_joined_message");
      logData.put("description", "User joined the meeting.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info("User joined meeting: data={}", logStr);

      return;
    }
    return;
  }

  private void userLeft(UserLeft message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.userLeft(message.userId);
      if (user != null) {

        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", m.getInternalId());
        logData.put("externalMeetingId", m.getExternalId());
        logData.put("name", m.getName());
        logData.put("userId", message.userId);
        logData.put("externalUserId", user.getExternalUserId());
        logData.put("username", user.getFullname());
        logData.put("role", user.getRole());
        logData.put("guest", user.isGuest());
        logData.put("guestStatus", user.getGuestStatus());
        logData.put("event", "user_left_message");
        logData.put("description", "User left the meeting.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info("User left meeting: data={}", logStr);

        if (m.getNumUsers() == 0) {
          // Last user the meeting. Mark this as the time
          // the meeting ended.
          m.setEndTime(System.currentTimeMillis());
        }

        RegisteredUser userRegistered = m.userUnregistered(message.userId);
        if (userRegistered != null) {
          log.info("User unregistered from meeting");
        } else {
          log.info("User was not unregistered from meeting because it was not found");
        }

        return;
      }

      return;
    }
  }

  private void updatedStatus(UserStatusChanged message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setStatus(message.status, message.value);
        return;
      }
      return;
    }
  }

  @Override
  public void handle(IMessage message) {
    receivedMessages.add(message);
  }

  public void setParamsProcessorUtil(ParamsProcessorUtil util) {
    this.paramsProcessorUtil = util;
  }

  public void setPresDownloadService(
    PresentationUrlDownloadService presDownloadService) {
    this.presDownloadService = presDownloadService;
  }

  public void userJoinedVoice(UserJoinedVoice message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setVoiceJoined(true);
        return;
      } else {
        if (message.userId.startsWith("v_")) {
          // A dial-in user joined the meeting. Dial-in users by convention has userId that starts with "v_".
          User vuser = new User(message.userId, message.userId,
                  message.name, "DIAL-IN-USER", "no-avatar-url", true, "VOICE-USER");
          vuser.setVoiceJoined(true);
          m.userJoined(vuser);
        }
      }
      return;
    }
  }

  public void userLeftVoice(UserLeftVoice message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        if (message.userId.startsWith("v_")) {
          // A dial-in user left the meeting. Dial-in users by convention has userId that starts with "v_".
          User vuser = m.userLeft(message.userId);
        } else {
          user.setVoiceJoined(false);
        }

        return;
      }
      return;
    }
  }

  public void userListeningOnly(UserListeningOnly message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setListeningOnly(message.listenOnly);
        return;
      }
      return;
    }
  }

  public void userSharedWebcam(UserSharedWebcam message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.addStream(message.stream);
        return;
      }
      return;
    }
  }

  public void userUnsharedWebcam(UserUnsharedWebcam message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.removeStream(message.stream);
        return;
      }
      return;
    }
  }

  private void userRoleChanged(UserRoleChanged message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setRole(message.role);
        log.debug("Setting new role in meeting {} for participant: {}", message.meetingId, user.getFullname());
        return;
      }
      log.warn("The participant {} doesn't exist in the meeting {}", message.userId, message.meetingId);
      return;
    }
    log.warn("The meeting {} doesn't exist", message.meetingId);
  }

  private void processMessage(final IMessage message) {
    Runnable task = new Runnable() {
      public void run() {
        if (message instanceof MeetingStarted) {
          meetingStarted((MeetingStarted) message);
        } else if (message instanceof MeetingDestroyed) {
          meetingDestroyed((MeetingDestroyed) message);
        } else if (message instanceof MeetingEnded) {
          meetingEnded((MeetingEnded) message);
        } else if (message instanceof UserJoined) {
          userJoined((UserJoined) message);
        } else if (message instanceof UserLeft) {
          userLeft((UserLeft) message);
        } else if (message instanceof UserStatusChanged) {
          updatedStatus((UserStatusChanged) message);
        } else if (message instanceof UserRoleChanged) {
          userRoleChanged((UserRoleChanged) message);
        } else if (message instanceof UserJoinedVoice) {
          userJoinedVoice((UserJoinedVoice) message);
        } else if (message instanceof UserLeftVoice) {
          userLeftVoice((UserLeftVoice) message);
        } else if (message instanceof UserListeningOnly) {
          userListeningOnly((UserListeningOnly) message);
        } else if (message instanceof UserSharedWebcam) {
          userSharedWebcam((UserSharedWebcam) message);
        } else if (message instanceof UserUnsharedWebcam) {
          userUnsharedWebcam((UserUnsharedWebcam) message);
        } else if (message instanceof CreateMeeting) {
          processCreateMeeting((CreateMeeting) message);
        } else if (message instanceof EndMeeting) {
          processEndMeeting((EndMeeting) message);
        } else if (message instanceof RegisterUser) {
          processRegisterUser((RegisterUser) message);
        } else if (message instanceof CreateBreakoutRoom) {
          processCreateBreakoutRoom((CreateBreakoutRoom) message);
        } else if (message instanceof PresentationUploadToken) {
          processPresentationUploadToken((PresentationUploadToken) message);
        } else if (message instanceof GuestStatusChangedEventMsg) {
          processGuestStatusChangedEventMsg((GuestStatusChangedEventMsg) message);
        } else if (message instanceof GuestPolicyChanged) {
          processGuestPolicyChanged((GuestPolicyChanged) message);
        } else if (message instanceof RecordChapterBreak) {
          processRecordingChapterBreak((RecordChapterBreak) message);
        }
      }
    };

    runExec.execute(task);
  }

  public void processGuestPolicyChanged(GuestPolicyChanged msg) {
    Meeting m = getMeeting(msg.meetingId);
    if (m != null) {
      m.setGuestPolicy(msg.policy);
    }
  }

  public void processRecordingChapterBreak(RecordChapterBreak msg) {
    recordingService.kickOffRecordingChapterBreak(msg.meetingId, msg.timestamp);
  }

  public void start() {
    log.info("Starting Meeting Service.");
    try {
      processMessage = true;
      Runnable messageReceiver = new Runnable() {
        public void run() {
          while (processMessage) {
            try {
              IMessage msg = receivedMessages.take();
              processMessage(msg);
            } catch (InterruptedException e) {
              // TODO Auto-generated catch block
              e.printStackTrace();
            } catch (Exception e) {
              log.error("Handling unexpected exception [{}]",
                e.toString());
            }
          }
        }
      };

      msgProcessorExec.execute(messageReceiver);
    } catch (Exception e) {
      log.error("Error PRocessing Message");
    }
  }

  public void stop() {
    processMessage = false;
    registeredUserCleaner.stop();
  }

  public void setRecordingService(RecordingService s) {
    recordingService = s;
  }

  public void setRedisStorageService(RedisStorageService mess) {
    storeService = mess;
  }

  public void setGw(IBbbWebApiGWApp gw) {
    this.gw = gw;
  }


  public void setRegisteredUserCleanupTimerTask(
    RegisteredUserCleanupTimerTask c) {
    registeredUserCleaner = c;
    registeredUserCleaner.setMeetingService(this);
    registeredUserCleaner.start();
  }

  public void setStunTurnService(StunTurnService s) {
    stunTurnService = s;
  }
}
