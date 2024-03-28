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

import java.io.File;
import java.net.URI;
import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import com.google.gson.JsonObject;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.client.utils.URIBuilder;
import org.bigbluebutton.api.domain.GuestPolicy;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.RegisteredUser;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.PublishedRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.UnpublishedRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DeletedRecordingMessage;
import org.bigbluebutton.api.messaging.messages.*;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.api2.domain.UploadedTrack;
import org.bigbluebutton.common2.redis.RedisStorageService;
import org.bigbluebutton.presentation.PresentationUrlDownloadService;
import org.bigbluebutton.presentation.imp.SlidesGenerationProgressNotifier;
import org.bigbluebutton.web.services.WaitingGuestCleanupTimerTask;
import org.bigbluebutton.web.services.UserCleanupTimerTask;
import org.bigbluebutton.web.services.EnteredUserCleanupTimerTask;
import org.bigbluebutton.web.services.callback.CallbackUrlService;
import org.bigbluebutton.web.services.callback.MeetingEndedEvent;
import org.bigbluebutton.web.services.turn.StunTurnService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.springframework.data.domain.*;

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
  private LearningDashboardService learningDashboardService;
  private WaitingGuestCleanupTimerTask waitingGuestCleaner;
  private UserCleanupTimerTask userCleaner;
  private EnteredUserCleanupTimerTask enteredUserCleaner;
  private StunTurnService stunTurnService;
  private RedisStorageService storeService;
  private CallbackUrlService callbackUrlService;
  private SlidesGenerationProgressNotifier notifier;

  private long usersTimeout;
  private long waitingGuestUsersTimeout;
  private long enteredUsersTimeout;

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

  public String getTokenByUserId(String internalUserId) {
      String result = null;
      for (Entry<String, UserSession> e : sessions.entrySet()) {
          String token = e.getKey();
          UserSession userSession = e.getValue();
          if (userSession.internalUserId.equals(internalUserId)) {
              result = token;
          }
      }
      return result;
  }

  public void registerUser(String meetingID, String internalUserId,
                           String fullname, String role, String externUserID,
                           String authToken, String avatarURL, Boolean guest,
                           Boolean authed, String guestStatus, Boolean excludeFromDashboard, Boolean leftGuestLobby) {
    handle(new RegisterUser(meetingID, internalUserId, fullname, role,
      externUserID, authToken, avatarURL, guest, authed, guestStatus, excludeFromDashboard, leftGuestLobby));

    Meeting m = getMeeting(meetingID);
    if (m != null) {
      RegisteredUser ruser = new RegisteredUser(authToken, internalUserId, guestStatus, excludeFromDashboard, leftGuestLobby);
      m.userRegistered(ruser);
    }
  }

  public void endMeetingPrompt(String meetingId) {
    handle(new EndMeetingPrompt(meetingId));
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

  public Boolean getAllowRequestsWithoutSession(String token) {
    UserSession us = getUserSessionWithAuthToken(token);
    if (us == null) {
      return false;
    } else {
      Meeting meeting = getMeeting(us.meetingID);
      if (meeting == null || meeting.isForciblyEnded()) return false;
      return meeting.getAllowRequestsWithoutSession();
    }
  }

  public UserSession removeUserSessionWithAuthToken(String token) {
    UserSession user = sessions.remove(token);
    if (user != null) {
      log.debug("Found user {} token={} to meeting {}", user.fullname, token, user.meetingID);
    }
    return user;
  }

  /**
   * Remove users who did not successfully reconnected to the meeting.
   */
  public void purgeUsers() {
    for (AbstractMap.Entry<String, Meeting> entry : this.meetings.entrySet()) {
      Long now = System.currentTimeMillis();
      Meeting meeting = entry.getValue();

      for (AbstractMap.Entry<String, User> userEntry : meeting.getUsersMap().entrySet()) {
        String userId = userEntry.getKey();
        User user = userEntry.getValue();

        if (!user.hasLeft()) continue;

        long elapsedTime = now - user.getLeftOn();
        if (elapsedTime >= usersTimeout) {
          meeting.removeUser(userId);

          Map<String, Object> logData = new HashMap<>();
          logData.put("meetingId", meeting.getInternalId());
          logData.put("userId", userId);
          logData.put("logCode", "removed_user");
          logData.put("description", "User left and was removed from the meeting.");

          Gson gson = new Gson();
          String logStr = gson.toJson(logData);

          log.info(" --analytics-- data={}", logStr);
        }
      }
    }
  }

  /**
   * Remove entered users who did not join.
   */
  public void purgeEnteredUsers() {
    for (AbstractMap.Entry<String, Meeting> entry : this.meetings.entrySet()) {
      Long now = System.currentTimeMillis();
      Meeting meeting = entry.getValue();

      for (AbstractMap.Entry<String, Long> enteredUser : meeting.getEnteredUsers().entrySet()) {
        String userId = enteredUser.getKey();

        long elapsedTime = now - enteredUser.getValue();
        if (elapsedTime >= enteredUsersTimeout) {
          meeting.removeEnteredUser(userId);

          Map<String, Object> logData = new HashMap<>();
          logData.put("meetingId", meeting.getInternalId());
          logData.put("userId", userId);
          logData.put("logCode", "purged_entered_user");
          logData.put("description", "Purged user that called ENTER from the API but never joined");

          Gson gson = new Gson();
          String logStr = gson.toJson(logData);

          log.info(" --analytics-- data={}", logStr);
        }
      }
    }
  }

  public void guestIsWaiting(String meetingId, String userId) {
    Meeting m = getMeeting(meetingId);
    if (m != null) {
      m.guestIsWaiting(userId);
    }
  }

  /**
   * Remove registered waiting guest users who left the waiting page.
   */
  public void purgeWaitingGuestUsers() {
    for (AbstractMap.Entry<String, Meeting> entry : this.meetings.entrySet()) {
      Long now = System.currentTimeMillis();
      Meeting meeting = entry.getValue();
      ConcurrentMap<String, User> users = meeting.getUsersMap();
      for (AbstractMap.Entry<String, RegisteredUser> registeredUser : meeting.getRegisteredUsers().entrySet()) {
        String registeredUserID = registeredUser.getKey();
        RegisteredUser ru = registeredUser.getValue();

        long elapsedTime = now - ru.getGuestWaitedOn();
        if (elapsedTime >= waitingGuestUsersTimeout && ru.getGuestStatus() == GuestPolicy.WAIT) {
          log.info("Purging user [{}]", registeredUserID);
          if (meeting.userUnregistered(registeredUserID) != null) {
            gw.guestWaitingLeft(meeting.getInternalId(), registeredUserID);
            meeting.setLeftGuestLobby(registeredUserID, true);
          };
        }
      }
    }
  }


  private void kickOffProcessingOfRecording(Meeting m) {
    if (m.isRecord() && m.getNumUsers() == 0) {
      processRecording(m);
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

  public PresentationUploadToken getPresentationUploadToken(String authzToken) {
    if(uploadAuthzTokens.containsKey(authzToken)) {
      return uploadAuthzTokens.get(authzToken);
    } else {
      return null;
    }
  }

  public void sendPresentationUploadMaxFilesizeMessage(PresentationUploadToken presUploadToken, int uploadedFileSize, int maxUploadFileSize) {
    notifier.sendUploadFileTooLargeMessage(presUploadToken, uploadedFileSize, maxUploadFileSize);
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
    Meeting existingId = getNotEndedMeetingWithId(internalMeetingId);
    Meeting existingTelVoice = getNotEndedMeetingWithTelVoice(m.getTelVoice());
    Meeting existingWebVoice = getNotEndedMeetingWithWebVoice(m.getWebVoice());
    if (existingId == null && existingTelVoice == null && existingWebVoice == null) {
      meetings.put(m.getInternalId(), m);
      handle(new CreateMeeting(m));
      return true;
    }

    return false;
  }

  private boolean storeEvents(Meeting m) {
    return m.isRecord() || m.getMeetingKeepEvents();
  }

  private void handleCreateMeeting(Meeting m) {
    if (m.isBreakout()) {
      Meeting parent = meetings.get(m.getParentMeetingId());
      parent.addBreakoutRoom(m.getExternalId());
      if (storeEvents(parent)) {
        storeService.addBreakoutRoom(parent.getInternalId(), m.getInternalId());
      }
    }

    if (storeEvents(m)) {
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
        breakoutMetadata.put("freeJoin", m.isFreeJoin().toString());
        breakoutMetadata.put("captureSlides", m.isCaptureSlides().toString());
        breakoutMetadata.put("captureNotes", m.isCaptureNotes().toString());
        breakoutMetadata.put("parentMeetingId", m.getParentMeetingId());
        storeService.recordBreakoutInfo(m.getInternalId(), breakoutMetadata);
      }
    }

    Map<String, Object> logData = new HashMap<>();
    logData.put("meetingId", m.getInternalId());
    logData.put("externalMeetingId", m.getExternalId());
    if (m.isBreakout()) {
      logData.put("sequence", m.getSequence());
      logData.put("freeJoin", m.isFreeJoin());
      logData.put("captureSlides",  m.isCaptureSlides());
      logData.put("captureNotes", m.isCaptureNotes());
      logData.put("parentMeetingId", m.getParentMeetingId());
    }
    logData.put("name", m.getName());
    logData.put("duration", m.getDuration());
    logData.put("isBreakout", m.isBreakout());
    logData.put("webcamsOnlyForModerator", m.getWebcamsOnlyForModerator());
    logData.put("meetingCameraCap", m.getMeetingCameraCap());
    logData.put("userCameraCap", m.getUserCameraCap());
    logData.put("maxPinnedCameras", m.getMaxPinnedCameras());
    logData.put("record", m.isRecord());
    logData.put("logCode", "create_meeting");
    logData.put("description", "Create meeting.");

    logData.put("meetingKeepEvents", m.getMeetingKeepEvents());
    logData.put("meetingLayout", m.getMeetingLayout());

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);

    log.info(" --analytics-- data={}", logStr);

    gw.createMeeting(m.getInternalId(), m.getExternalId(), m.getParentMeetingId(), m.getName(), m.isRecord(),
            m.getTelVoice(), m.getDuration(), m.getAutoStartRecording(), m.getAllowStartStopRecording(),
            m.getRecordFullDurationMedia(),
            m.getWebcamsOnlyForModerator(), m.getMeetingCameraCap(), m.getUserCameraCap(), m.getMaxPinnedCameras(), m.getModeratorPassword(), m.getViewerPassword(),
            m.getLearningDashboardAccessToken(), m.getCreateTime(),
            formatPrettyDate(m.getCreateTime()), m.isBreakout(), m.getSequence(), m.isFreeJoin(), m.getMetadata(),
            m.getGuestPolicy(), m.getAuthenticatedGuest(), m.getMeetingLayout(), m.getWelcomeMessageTemplate(), m.getWelcomeMessage(), m.getModeratorOnlyMessage(),
            m.getDialNumber(), m.getMaxUsers(), m.getMaxUserConcurrentAccesses(),
            m.getMeetingExpireIfNoUserJoinedInMinutes(), m.getMeetingExpireWhenLastUserLeftInMinutes(),
            m.getUserInactivityInspectTimerInMinutes(), m.getUserInactivityThresholdInMinutes(),
            m.getUserActivitySignResponseDelayInMinutes(), m.getEndWhenNoModerator(), m.getEndWhenNoModeratorDelayInMinutes(),
            m.getMuteOnStart(), m.getAllowModsToUnmuteUsers(), m.getAllowModsToEjectCameras(), m.getMeetingKeepEvents(),
            m.breakoutRoomsParams, m.lockSettingsParams, m.getHtml5InstanceId(),
            m.getGroups(), m.getDisabledFeatures(), m.getNotifyRecordingIsOn(),
            m.getPresentationUploadExternalDescription(), m.getPresentationUploadExternalUrl());
  }

  private String formatPrettyDate(Long timestamp) {
    return new Date(timestamp).toString();
  }

  private void processCreateMeeting(CreateMeeting message) {
    handleCreateMeeting(message.meeting);
  }

  private void processRegisterUser(RegisterUser message) {
    gw.registerUser(message.meetingID,
      message.internalUserId, message.fullname, message.role,
      message.externUserID, message.authToken, message.avatarURL, message.guest,
            message.authed, message.guestStatus, message.excludeFromDashboard);
  }

  private void processEndMeetingPrompt(EndMeetingPrompt message) {
    gw.endMeetingPrompt(message.meetingId);
  }

  public Meeting getMeeting(String meetingId) {
      if (meetingId == null)
          return null;
      for (Map.Entry<String, Meeting> entry : meetings.entrySet()) {
          String key = entry.getKey();
          if (key.startsWith(meetingId))
              return entry.getValue();
      }

      return null;
  }

  public Collection<Meeting> getMeetingsWithId(String meetingId) {
    if (meetingId == null)
      return Collections.<Meeting>emptySet();

    Collection<Meeting> m = new HashSet<>();

    for (Map.Entry<String, Meeting> entry : meetings.entrySet()) {
        String key = entry.getKey();
        if (key.startsWith(meetingId))
            m.add(entry.getValue());
    }

    return m;
  }

  public Meeting getNotEndedMeetingWithId(String meetingId) {
      if (meetingId == null)
          return null;
      for (Map.Entry<String, Meeting> entry : meetings.entrySet()) {
          String key = entry.getKey();
          if (key.startsWith(meetingId)) {
              Meeting m = entry.getValue();
              if (!m.isForciblyEnded())
                  return m;
          }
      }
      return null;
  }

  public Meeting getNotEndedMeetingWithTelVoice(String telVoice) {
      if (telVoice == null)
          return null;
      for (Map.Entry<String, Meeting> entry : meetings.entrySet()) {
          Meeting m = entry.getValue();
          if (telVoice.equals(m.getTelVoice())) {
              if (!m.isForciblyEnded())
                  return m;
          }
      }
      return null;
  }

  public Meeting getNotEndedMeetingWithWebVoice(String webVoice) {
      if (webVoice == null)
          return null;
      for (Map.Entry<String, Meeting> entry : meetings.entrySet()) {
          Meeting m = entry.getValue();
          if (webVoice.equals(m.getWebVoice())) {
              if (!m.isForciblyEnded())
                  return m;
          }
      }
      return null;
  }

  public Boolean validateTextTrackSingleUseToken(String recordId, String caption, String token) {
    return recordingService.validateTextTrackSingleUseToken(recordId, caption, token);
  }

  public String getRecordingTextTracks(String recordId) {
    return recordingService.getRecordingTextTracks(recordId);
  }

  public String putRecordingTextTrack(String recordId, String kind, String lang, File file, String label,
          String origFilename, String trackId, String contentType, String tempFilename) {

    Map<String, Object> logData = new HashMap<>();
    logData.put("recordId", recordId);
    logData.put("kind", kind);
    logData.put("lang", lang);
    logData.put("label", label);
    logData.put("origFilename", origFilename);
    logData.put("contentType", contentType);
    logData.put("tempFilename", tempFilename);
    logData.put("logCode", "recording_captions_uploaded");
    logData.put("description", "Captions for recording uploaded.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);
    log.info(" --analytics-- data={}", logStr);

      UploadedTrack track = new UploadedTrack(recordId, kind, lang, label, origFilename, file, trackId,
              getCaptionTrackInboxDir(), contentType, tempFilename);
      return recordingService.putRecordingTextTrack(track);
  }

  public String getCaptionTrackInboxDir() {
  	return recordingService.getCaptionTrackInboxDir();
  }

  public String getCaptionsDir() {
    return recordingService.getCaptionsDir();
  }

  public boolean isRecordingExist(String recordId) {
    return recordingService.isRecordingExist(recordId);
  }

  public boolean isMeetingWithDisabledPresentation(String meetingId) {
    Meeting m = getMeeting(meetingId);
    return m.getDisabledFeatures().contains("presentation");
  }

  public String getRecordings2x(List<String> idList, List<String> states, Map<String, String> metadataFilters, String offset, String limit) {
    Pageable pageable = null;
    int o = -1;
    int l = -1;

    try {
      o = Integer.parseInt(offset);
      if(o < 0) o = 0;
    } catch(NumberFormatException e) {
      log.info("Invalid offset parameter {}", offset);
      o = 0;
    }

    try {
      l = Integer.parseInt(limit);
      if(l < 1) l = 1;
      else if(l > 100) l = 100;
    } catch(NumberFormatException e) {
      log.info("Invalid limit parameter {}", limit);
    }

    if(l != -1) pageable = PageRequest.ofSize(l);
    return recordingService.getRecordings2x(idList, states, metadataFilters, o, pageable);
  }

  public boolean existsAnyRecording(List<String> idList) {
    return recordingService.existAnyRecording(idList);
  }

  public void setPublishRecording(List<String> idList, boolean publish) {
    for (String id : idList) {
      if (publish) {
        if (recordingService.changeState(id, Recording.STATE_PUBLISHED)) {
          gw.publishedRecording(new PublishedRecordingMessage(id));
        }
      } else {
        if (recordingService.changeState(id, Recording.STATE_UNPUBLISHED)) {
          gw.unpublishedRecording(new UnpublishedRecordingMessage(id));
        }
      }
    }
  }

  public void deleteRecordings(List<String> idList) {
    for (String id : idList) {
      if (recordingService.changeState(id, Recording.STATE_DELETED)) {
        gw.deletedRecording(new DeletedRecordingMessage(id));
      }
    }
  }

  public void updateRecordings(List<String> idList, Map<String, String> metaParams) {
    recordingService.updateMetaParams(idList, metaParams);
  }

  public void processRecording(Meeting m) {
    if (m.isRecord()) {
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", m.getInternalId());
      logData.put("externalMeetingId", m.getExternalId());
      logData.put("name", m.getName());
      logData.put("logCode", "kick_off_ingest_and_processing");
      logData.put("description", "Start processing of recording.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(" --analytics-- data={}", logStr);
      recordingService.startIngestAndProcessing(m.getInternalId());
    }
  }

  public void endMeeting(String meetingId) {
    handle(new EndMeeting(meetingId));
  }

  private void processCreateBreakoutRoom(CreateBreakoutRoom message) {
    Meeting parentMeeting = getMeeting(message.parentMeetingId);
    if (parentMeeting != null) {

      Map<String, String> params = new HashMap<>();
      params.put(ApiParams.NAME, message.name);
      params.put(ApiParams.MEETING_ID, message.meetingId);
      params.put(ApiParams.PARENT_MEETING_ID, message.parentMeetingId);
      params.put(ApiParams.IS_BREAKOUT, "true");
      params.put(ApiParams.SEQUENCE, message.sequence.toString());
      params.put(ApiParams.FREE_JOIN, message.freeJoin.toString());
      params.put(ApiParams.BREAKOUT_ROOMS_CAPTURE_SLIDES, message.captureSlides.toString());
      params.put(ApiParams.BREAKOUT_ROOMS_CAPTURE_NOTES, message.captureNotes.toString());
      params.put(ApiParams.BREAKOUT_ROOMS_CAPTURE_NOTES_FILENAME, message.captureNotesFilename.toString());
      params.put(ApiParams.BREAKOUT_ROOMS_CAPTURE_SLIDES_FILENAME, message.captureSlidesFilename.toString());
      params.put(ApiParams.ATTENDEE_PW, message.viewerPassword);
      params.put(ApiParams.MODERATOR_PW, message.moderatorPassword);
      params.put(ApiParams.DIAL_NUMBER, message.dialNumber);
      params.put(ApiParams.VOICE_BRIDGE, message.voiceConfId);
      params.put(ApiParams.DURATION, message.durationInMinutes.toString());
      params.put(ApiParams.RECORD, message.record.toString());
      params.put(ApiParams.WELCOME, getMeeting(message.parentMeetingId).getWelcomeMessageTemplate());
      params.put(ApiParams.NOTIFY_RECORDING_IS_ON,parentMeeting.getNotifyRecordingIsOn().toString());

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
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", message.meetingId);
      logData.put("parentMeetingId", message.parentMeetingId);
      logData.put("name", message.name);
      logData.put("logCode", "create_breakout_failed");
      logData.put("reason", "Parent not found.");
      logData.put("description", "Create breakout failed.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.error(" --analytics-- data={}", logStr);
    }
  }

  private void processUpdateRecordingStatus(UpdateRecordingStatus message) {
    Meeting m = getMeeting(message.meetingId);
      // Set only once
      if (m != null && message.recording && !m.haveRecordingMarks()) {
          m.setHaveRecordingMarks(message.recording);
      }
  }

  private void processEndMeeting(EndMeeting message) {
    gw.endMeeting(new EndMeetingMessage(message.meetingId));
  }

  private void processRemoveEndedMeeting(MeetingEnded message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      m.setForciblyEnded(true);
      processRecording(m);
      if (m.getMeetingKeepEvents()) {
        // The creation of the ended tag must occur after the creation of the
        // recorded tag to avoid concurrency issues at the recording scripts
        recordingService.markAsEnded(m.getInternalId());
      }
      destroyMeeting(m.getInternalId());
      meetings.remove(m.getInternalId());
      removeUserSessions(m.getInternalId());

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", m.getInternalId());
      logData.put("externalMeetingId", m.getExternalId());
      logData.put("name", m.getName());
      logData.put("duration", m.getDuration());
      logData.put("record", m.isRecord());
      logData.put("logCode", "meeting_removed_from_running");
      logData.put("description", "Meeting removed from list of running meetings.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(" --analytics-- data={}", logStr);
    }
  }

  private void processGuestStatusChangedEventMsg(GuestStatusChangedEventMsg message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      for (GuestsStatus guest : message.guests) {
        m.setGuestStatusWithId(guest.userId, guest.status);
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

  public Map<String, String> getUserCustomData(
      Meeting meeting,
      String externUserID,
      Map<String, String> params) {
    Map<String, String> resp = paramsProcessorUtil.getUserCustomData(params);

    // If is breakout room, merge with user's parent meeting userdata
    if (meeting.isBreakout()) {
      String parentMeetingId = meeting.getParentMeetingId();
      Meeting parentMeeting = getMeeting(parentMeetingId);

      if (parentMeeting != null) {
        // Get parent meeting user's internal id from it's breakout external id
        // parentUserInternalId-breakoutRoomNumber
        String parentUserId = externUserID.split("-")[0];
        User parentUser = parentMeeting.getUserById(parentUserId);

        if (parentUser != null) {
          // Custom data is stored indexed by user's external id
          Map<String, Object> customData = parentMeeting.getUserCustomData(parentUser.getExternalUserId());

          if (customData != null) {
            for (String key : customData.keySet()) {
              if (!resp.containsKey(key)) {
                resp.put(key, String.valueOf(customData.get(key)));
              }
            }
          }
        }
      }
    }

    return resp;
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
        logData.put("logCode", "meeting_started");
        logData.put("description", "Meeting has started.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info(" --analytics-- data={}", logStr);
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
        logData.put("logCode", "meeting_restarted");
        logData.put("description", "Meeting has restarted.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info(" --analytics-- data={}", logStr);
      }
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
      logData.put("logCode", "meeting_destroyed");
      logData.put("description", "Meeting has been destroyed.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(" --analytics-- data={}", logStr);
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
      logData.put("logCode", "meeting_ended");
      logData.put("description", "Meeting has ended.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(" --analytics-- data={}", logStr);

      String endCallbackUrl = "endCallbackUrl".toLowerCase();
      Map<String, String> metadata = m.getMetadata();
      if (!m.isBreakout()) {
        if (metadata.containsKey(endCallbackUrl)) {
          String callbackUrl = metadata.get(endCallbackUrl);
          try {
            callbackUrl = new URIBuilder(new URI(callbackUrl))
              .addParameter("recordingmarks", m.haveRecordingMarks() ? "true" : "false")
              .addParameter("meetingID", m.getExternalId()).build().toURL().toString();
            MeetingEndedEvent event = new MeetingEndedEvent(m.getInternalId(), m.getExternalId(), m.getName(), callbackUrl);
            processMeetingEndedCallback(event);
          } catch (Exception e) {
            log.error("Error in callback url=[{}]", callbackUrl, e);
          }
        }

        if (! StringUtils.isEmpty(m.getMeetingEndedCallbackURL())) {
          String meetingEndedCallbackURL = m.getMeetingEndedCallbackURL();
          callbackUrlService.handleMessage(new MeetingEndedEvent(m.getInternalId(), m.getExternalId(), m.getName(), meetingEndedCallbackURL));
        }
      }

      //Remove Learning Dashboard files
      if(!m.getDisabledFeatures().contains("learningDashboard") && m.getLearningDashboardCleanupDelayInMinutes() > 0) {
        learningDashboardService.removeJsonDataFile(message.meetingId, m.getLearningDashboardCleanupDelayInMinutes());
      }

      processRemoveEndedMeeting(message);
    }
  }

  private void processMeetingEndedCallback(MeetingEndedEvent event) {
    try {
      callbackUrlService.handleMessage(event);
    } catch (Exception e) {
      log.error("Error in callback url=[{}]", event.getCallbackUrl(), e);
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
        message.name, message.role, message.avatarURL, message.guest, message.guestStatus,
              message.clientType);

      if(m.getMaxUsers() > 0 && m.countUniqueExtIds() >= m.getMaxUsers()) {
        m.removeEnteredUser(user.getInternalUserId());
        return;
      }

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
      logData.put("logCode", "user_joined_message");
      logData.put("description", "User joined the meeting.");
      logData.put("clientType", user.getClientType());

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info(" --analytics-- data={}", logStr);
    }
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
        logData.put("logCode", "user_left_message");
        logData.put("description", "User left the meeting.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info(" --analytics-- data={}", logStr);

        if (m.getNumUsers() == 0) {
          // Last user the meeting. Mark this as the time
          // the meeting ended.
          m.setEndTime(System.currentTimeMillis());
        }
      }
    }
  }

  private void updatedStatus(UserStatusChanged message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setStatus(message.status, message.value);
      }
    }
  }

  public void processLearningDashboard(LearningDashboard message) {
    //Get all data from Json instead of getMeeting(message.meetingId), to process messages received even after meeting ended
    JsonObject activityJsonObject = new Gson().fromJson(message.activityJson, JsonObject.class).getAsJsonObject();

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", activityJsonObject.get("intId").getAsString());
    logData.put("externalMeetingId", activityJsonObject.get("extId").getAsString());
    logData.put("name", activityJsonObject.get("name").getAsString());
    logData.put("logCode", "update_activity_json");
    logData.put("description", "Updating activities json.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);

    log.info(" --analytics-- data={}", logStr);

    learningDashboardService.writeJsonDataFile(message.meetingId, message.learningDashboardAccessToken, message.activityJson);
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
      } else {
        if (message.userId.startsWith("v_")) {
          // A dial-in user joined the meeting. Dial-in users by convention has userId that starts with "v_".
                    User vuser = new User(message.userId, message.userId, message.name, "DIAL-IN-USER", "",
                            true, GuestPolicy.ALLOW, "DIAL-IN");
          vuser.setVoiceJoined(true);
          m.userJoined(vuser);
        }
      }
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
          // userLeftVoice is also used when user leaves Global (listenonly)
          // audio. Also tetting listenOnly to false is not a problem,
          // once user can't join both voice/mic and global/listenonly
          // at the same time.
          user.setListeningOnly(false);
        }
      }
    }
  }

  public void userListeningOnly(UserListeningOnly message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setListeningOnly(message.listenOnly);
      }
    }
  }

  public void userSharedWebcam(UserSharedWebcam message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.addStream(message.stream);
      }
    }
  }

  public void userUnsharedWebcam(UserUnsharedWebcam message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.removeStream(message.stream);
      }
    }
  }

  private void userRoleChanged(UserRoleChanged message) {
    Meeting m = getMeeting(message.meetingId);
    if (m != null) {
      User user = m.getUserById(message.userId);
      if (user != null) {
        user.setRole(message.role);
        String sessionToken = getTokenByUserId(user.getInternalUserId());
        if (sessionToken != null) {
            UserSession userSession = getUserSessionWithAuthToken(sessionToken);
            userSession.role = message.role;
            sessions.replace(sessionToken, userSession);
        }
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
        } else if (message instanceof PositionInWaitingQueueUpdated) {
          processPositionInWaitingQueueUpdated((PositionInWaitingQueueUpdated) message);
        } else if (message instanceof GuestStatusChangedEventMsg) {
          processGuestStatusChangedEventMsg((GuestStatusChangedEventMsg) message);
        } else if (message instanceof GuestPolicyChanged) {
          processGuestPolicyChanged((GuestPolicyChanged) message);
        } else if (message instanceof GuestLobbyMessageChanged) {
          processGuestLobbyMessageChanged((GuestLobbyMessageChanged) message);
        } else if (message instanceof PrivateGuestLobbyMessageChanged) {
          processPrivateGuestLobbyMessageChanged((PrivateGuestLobbyMessageChanged) message);
        } else if (message instanceof RecordChapterBreak) {
          processRecordingChapterBreak((RecordChapterBreak) message);
        } else if (message instanceof MakePresentationDownloadableMsg) {
          processMakePresentationDownloadableMsg((MakePresentationDownloadableMsg) message);
        } else if (message instanceof UpdateRecordingStatus) {
          processUpdateRecordingStatus((UpdateRecordingStatus) message);
        } else if (message instanceof LearningDashboard) {
          processLearningDashboard((LearningDashboard) message);
        } else if (message instanceof EndMeetingPrompt) {
          processEndMeetingPrompt((EndMeetingPrompt) message);
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

  public void processPositionInWaitingQueueUpdated(PositionInWaitingQueueUpdated msg) {
    Meeting m = getMeeting(msg.meetingId);
    HashMap<String,String> guestUsers = msg.guests;
    if (m != null) {
      m.setWaitingPositionsInWaitingQueue(guestUsers);
    }
  }

  public void processGuestLobbyMessageChanged(GuestLobbyMessageChanged msg) {
    Meeting m = getMeeting(msg.meetingId);
    if (m != null) {
      m.setGuestLobbyMessage(msg.message);
    }
  }

  public void processPrivateGuestLobbyMessageChanged(PrivateGuestLobbyMessageChanged msg) {
    Meeting m = getMeeting(msg.meetingId);
    if (m != null) {
      m.setPrivateGuestLobbyMessage(msg.guestId, msg.message);
    }
  }

  public void processRecordingChapterBreak(RecordChapterBreak msg) {
    recordingService.kickOffRecordingChapterBreak(msg.meetingId, msg.timestamp);
  }

  private void processMakePresentationDownloadableMsg(MakePresentationDownloadableMsg msg) {
    recordingService.processMakePresentationDownloadableMsg(msg);
  }

  public File getDownloadablePresentationFile(String meetingId, String presId, String presFilename) {
    return recordingService.getDownloadablePresentationFile(meetingId, presId, presFilename);
  }

  public void start() {
    log.info("Starting Meeting Service.");
    try {
      processMessage = true;
      Process p = Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", "cat /etc/bigbluebutton/bigbluebutton-release | cut -d '=' -f2"});

      BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));

      String apiVersionFromFile = reader.readLine();

      paramsProcessorUtil.setBbbVersion(apiVersionFromFile);
      Runnable messageReceiver = new Runnable() {
        public void run() {
          while (processMessage) {
            try {
              IMessage msg = receivedMessages.take();
              processMessage(msg);
            } catch (InterruptedException e) {
              log.error("InterruptedException while starting Meeting Service", e);
            } catch (Exception e) {
              log.error("Handling unexpected exception", e);
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
    waitingGuestCleaner.stop();
    userCleaner.stop();
    enteredUserCleaner.stop();
  }

  public void setRecordingService(RecordingService s) {
    recordingService = s;
  }

  public void setLearningDashboardService(LearningDashboardService s) {
    learningDashboardService = s;
  }

  public void setRedisStorageService(RedisStorageService mess) {
    storeService = mess;
  }

  public void setCallbackUrlService(CallbackUrlService service) {
    callbackUrlService = service;
  }

  public void setGw(IBbbWebApiGWApp gw) {
    this.gw = gw;
  }

  public void setWaitingGuestCleanupTimerTask(WaitingGuestCleanupTimerTask c) {
    waitingGuestCleaner = c;
    waitingGuestCleaner.setMeetingService(this);
    waitingGuestCleaner.start();
  }

  public void setEnteredUserCleanupTimerTask(EnteredUserCleanupTimerTask c) {
    enteredUserCleaner = c;
    enteredUserCleaner.setMeetingService(this);
    enteredUserCleaner.start();
  }

  public void setUserCleanupTimerTask(UserCleanupTimerTask c) {
    userCleaner = c;
    userCleaner.setMeetingService(this);
    userCleaner.start();
  }

  public void setStunTurnService(StunTurnService s) {
    stunTurnService = s;
  }

  public void setUsersTimeout(long value) {
    usersTimeout = value;
  }

  public void setWaitingGuestUsersTimeout(long value) {
    waitingGuestUsersTimeout = value;
  }

  public void setEnteredUsersTimeout(long value) {
    enteredUsersTimeout = value;
  }

  public void setSlidesGenerationProgressNotifier(SlidesGenerationProgressNotifier notifier) {
    this.notifier = notifier;
  }

}
