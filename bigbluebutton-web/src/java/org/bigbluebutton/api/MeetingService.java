/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Playback;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.api.messaging.messages.CreateBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.CreateMeeting;
import org.bigbluebutton.api.messaging.messages.EndBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.EndMeeting;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.bigbluebutton.api.messaging.messages.MeetingEnded;
import org.bigbluebutton.api.messaging.messages.MeetingStarted;
import org.bigbluebutton.api.messaging.messages.RegisterUser;
import org.bigbluebutton.api.messaging.messages.RemoveExpiredMeetings;
import org.bigbluebutton.api.messaging.messages.UserJoined;
import org.bigbluebutton.api.messaging.messages.UserJoinedVoice;
import org.bigbluebutton.api.messaging.messages.UserLeft;
import org.bigbluebutton.api.messaging.messages.UserLeftVoice;
import org.bigbluebutton.api.messaging.messages.UserListeningOnly;
import org.bigbluebutton.api.messaging.messages.UserSharedWebcam;
import org.bigbluebutton.api.messaging.messages.UserStatusChanged;
import org.bigbluebutton.api.messaging.messages.UserUnsharedWebcam;
import org.bigbluebutton.presentation.PresentationUrlDownloadService;
import org.bigbluebutton.api.messaging.messages.StunTurnInfoRequested;
import org.bigbluebutton.web.services.ExpiredMeetingCleanupTimerTask;
import org.bigbluebutton.web.services.RegisteredUserCleanupTimerTask;
import org.bigbluebutton.web.services.turn.StunServer;
import org.bigbluebutton.web.services.turn.StunTurnService;
import org.bigbluebutton.web.services.turn.TurnEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class MeetingService implements MessageListener {
    private static Logger log = LoggerFactory.getLogger(MeetingService.class);

    private BlockingQueue<IMessage> receivedMessages = new LinkedBlockingQueue<IMessage>();
    private volatile boolean processMessage = false;

    private final Executor msgProcessorExec = Executors
            .newSingleThreadExecutor();
    private final Executor runExec = Executors.newSingleThreadExecutor();

    /**
     * http://ria101.wordpress.com/2011/12/12/concurrenthashmap-avoid-a-common-
     * misuse/
     */
    private final ConcurrentMap<String, Meeting> meetings;
    private final ConcurrentMap<String, UserSession> sessions;

    private int defaultMeetingExpireDuration = 1;
    private int defaultMeetingCreateJoinDuration = 5;
    private RecordingService recordingService;
    private MessagingService messagingService;
    private ExpiredMeetingCleanupTimerTask cleaner;
    private RegisteredUserCleanupTimerTask registeredUserCleaner;
    private StunTurnService stunTurnService;
    private boolean removeMeetingWhenEnded = false;

    private ParamsProcessorUtil paramsProcessorUtil;
    private PresentationUrlDownloadService presDownloadService;

    public MeetingService() {
        meetings = new ConcurrentHashMap<String, Meeting>(8, 0.9f, 1);
        sessions = new ConcurrentHashMap<String, UserSession>(8, 0.9f, 1);
    }

    public void addUserSession(String token, UserSession user) {
        sessions.put(token, user);
    }

    public void registerUser(String meetingID, String internalUserId,
            String fullname, String role, String externUserID, String authToken, String avatarURL) {
        handle(new RegisterUser(meetingID, internalUserId, fullname, role,
                externUserID, authToken, avatarURL));
    }

    public UserSession getUserSession(String token) {
        return sessions.get(token);
    }

    public UserSession removeUserSession(String token) {
        UserSession user = sessions.remove(token);
        if (user != null) {
            log.debug("Found user [" + user.fullname + "] token=[" + token
                    + "] to meeting [" + user.meetingID + "]");
        }
        return user;
    }

    /**
     * Remove the meetings that have ended from the list of running meetings.
     */
    public void removeExpiredMeetings() {
        handle(new RemoveExpiredMeetings());
    }

    /**
     * Remove registered users who did not successfully joined the meeting.
     */
    public void purgeRegisteredUsers() {
        for (AbstractMap.Entry<String, Meeting> entry : this.meetings.entrySet()) {
            Long now = System.nanoTime();
            Meeting meeting = entry.getValue();

            ConcurrentMap<String, User> users = meeting.getUsersMap();

            for (AbstractMap.Entry<String, Long> registeredUser : meeting.getRegisteredUsers().entrySet()) {
                String registeredUserID = registeredUser.getKey();
                Long registeredUserDate = registeredUser.getValue();

                long registrationTime = registeredUserDate.longValue();
                long elapsedTime = now - registrationTime;
                if ( elapsedTime >= 60000 && !users.containsKey(registeredUserID)) {
                    meeting.userUnregistered(registeredUserID);
                }
            }
        }
        handle(new RemoveExpiredMeetings());
    }

    private void kickOffProcessingOfRecording(Meeting m) {
        if (m.isRecord() && m.getNumUsers() == 0) {
            Map<String, Object> logData = new HashMap<String, Object>();
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

    private void processMeetingForRemoval(Meeting m) {
        kickOffProcessingOfRecording(m);
        destroyMeeting(m.getInternalId());
        meetings.remove(m.getInternalId());
        removeUserSessions(m.getInternalId());
    }

    private void removeUserSessions(String meetingId) {
        Iterator<Map.Entry<String, UserSession>> iterator = sessions.entrySet()
                .iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, UserSession> entry = iterator.next();
            UserSession userSession = entry.getValue();

            if (userSession.meetingID.equals(meetingId)) {
                iterator.remove();
            }
        }
    }

    private void checkAndRemoveExpiredMeetings() {
        for (Meeting m : meetings.values()) {
            if (m.hasExpired(defaultMeetingExpireDuration)) {
                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("event", "removing_meeting");
                logData.put("description", "Meeting has expired.");

                Gson gson = new Gson();
                String logStr = gson.toJson(logData);
                log.info("Removing expired meeting: data={}", logStr);

                processMeetingForRemoval(m);
                continue;
            }

            if (m.isForciblyEnded()) {
                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("event", "removing_meeting");
                logData.put("description", "Meeting forcefully ended.");

                Gson gson = new Gson();
                String logStr = gson.toJson(logData);

                log.info("Removing ended meeting: data={}", logStr);
                processMeetingForRemoval(m);
                continue;
            }

            if (m.wasNeverJoined(defaultMeetingCreateJoinDuration)) {
                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("event", "removing_meeting");
                logData.put("description", "Meeting has not been joined.");

                Gson gson = new Gson();
                String logStr = gson.toJson(logData);

                log.info("Removing un-joined meeting: data={}", logStr);

                destroyMeeting(m.getInternalId());
                meetings.remove(m.getInternalId());
                removeUserSessions(m.getInternalId());
                continue;
            }

            if (m.hasExceededDuration()) {
                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("event", "removing_meeting");
                logData.put("description", "Meeting exceeded duration.");

                Gson gson = new Gson();
                String logStr = gson.toJson(logData);

                log.info("Removing past duration meeting: data={}", logStr);

                endMeeting(m.getInternalId());
            }
        }
    }

    private void destroyMeeting(String meetingID) {
        messagingService.destroyMeeting(meetingID);
    }

    public Collection<Meeting> getMeetings() {
        return meetings.isEmpty() ? Collections.<Meeting> emptySet()
                : Collections.unmodifiableCollection(meetings.values());
    }

    public Collection<UserSession> getSessions() {
        return sessions.isEmpty() ? Collections.<UserSession> emptySet()
                : Collections.unmodifiableCollection(sessions.values());
    }

    public void createMeeting(Meeting m) {
        handle(new CreateMeeting(m));
    }

    private void handleCreateMeeting(Meeting m) {
        meetings.put(m.getInternalId(), m);
        if (m.isRecord()) {
            Map<String, String> metadata = new LinkedHashMap<String, String>();
            metadata.putAll(m.getMetadata());
            // TODO: Need a better way to store these values for recordings
            metadata.put("meetingId", m.getExternalId());
            metadata.put("meetingName", m.getName());

            messagingService.recordMeetingInfo(m.getInternalId(), metadata);
        }

        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", m.getInternalId());
        logData.put("externalMeetingId", m.getExternalId());
        logData.put("name", m.getName());
        logData.put("duration", m.getDuration());
        logData.put("record", m.isRecord());
        logData.put("event", "create_meeting");
        logData.put("description", "Create meeting.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.info("Create meeting: data={}", logStr);

        messagingService.createMeeting(m.getInternalId(), m.getExternalId(),
                m.getName(), m.isRecord(), m.getTelVoice(), m.getDuration(),
                m.getAutoStartRecording(), m.getAllowStartStopRecording(),
                m.getModeratorPassword(), m.getViewerPassword(),
                m.getCreateTime(), formatPrettyDate(m.getCreateTime()), m.isBreakout());
    }

    private String formatPrettyDate(Long timestamp) {
        return new Date(timestamp).toString();
    }

    private void processCreateMeeting(CreateMeeting message) {
        handleCreateMeeting(message.meeting);
    }

    private void processRegisterUser(RegisterUser message) {
        messagingService.registerUser(message.meetingID,
                message.internalUserId, message.fullname, message.role,
                message.externUserID, message.authToken, message.avatarURL);
    }

    public String addSubscription(String meetingId, String event,
            String callbackURL) {
        String sid = messagingService.storeSubscription(meetingId, event,
                callbackURL);
        return sid;
    }

    public boolean removeSubscription(String meetingId, String subscriptionId) {
        return messagingService.removeSubscription(meetingId, subscriptionId);
    }

    public List<Map<String, String>> listSubscriptions(String meetingId) {
        return messagingService.listSubscriptions(meetingId);
    }
    
    public Meeting getMeeting(String meetingId) {
        return getMeeting(meetingId, false);
    }

    public Meeting getMeeting(String meetingId, Boolean exactMatch) {
        if (meetingId == null)
            return null;
        for (String key : meetings.keySet()) {
            if ((!exactMatch && key.startsWith(meetingId))
                    || (exactMatch && key.equals(meetingId)))
                return (Meeting) meetings.get(key);
        }

        return null;
    }

    public Collection<Meeting> getMeetingsWithId(String meetingId) {
        if (meetingId == null)
            return Collections.<Meeting> emptySet();

        Collection<Meeting> m = new HashSet<Meeting>();

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
                Meeting m = (Meeting) meetings.get(key);
                if (!m.isForciblyEnded())
                    return m;
            }
        }

        return null;
    }

    public Map<String, Recording> getRecordings(List<String> idList,
            List<String> states) {
        List<Recording> recsList = recordingService.getRecordings(idList,
                states);
        Map<String, Recording> recs = reorderRecordings(recsList);
        return recs;
    }

    public Map<String, Recording> filterRecordingsByMetadata(
            Map<String, Recording> recordings,
            Map<String, String> metadataFilters) {
        return recordingService.filterRecordingsByMetadata(recordings,
                metadataFilters);
    }

    public Map<String, Recording> reorderRecordings(List<Recording> olds) {
        Map<String, Recording> map = new HashMap<String, Recording>();
        for (Recording r : olds) {
            if (!map.containsKey(r.getId())) {
                Map<String, String> meta = r.getMetadata();
                String mid = meta.remove("meetingId");
                String name = meta.remove("meetingName");

                r.setMeetingID(mid);
                r.setName(name);

                ArrayList<Playback> plays = new ArrayList<Playback>();

                if (r.getPlaybackFormat() != null) {
                    plays.add(new Playback(r.getPlaybackFormat(), r
                            .getPlaybackLink(), getDurationRecording(
                            r.getPlaybackDuration(), r.getEndTime(),
                            r.getStartTime()), r.getPlaybackExtensions()));
                }

                r.setPlaybacks(plays);
                map.put(r.getId(), r);
            } else {
                Recording rec = map.get(r.getId());
                rec.getPlaybacks().add(
                        new Playback(r.getPlaybackFormat(),
                                r.getPlaybackLink(), getDurationRecording(
                                        r.getPlaybackDuration(),
                                        r.getEndTime(), r.getStartTime()), r
                                        .getPlaybackExtensions()));
            }
        }

        return map;
    }

    private int getDurationRecording(String playbackDuration, String end,
            String start) {
        int duration;
        try {
            if (!playbackDuration.equals("")) {
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
	
	public void deleteRecordings(ArrayList<String> idList){
          for (String id : idList) {
            recordingService.changeState(id, Recording.STATE_DELETED);
        }
    }

    public void processRecording(String meetingId) {
        recordingService.startIngestAndProcessing(meetingId);
    }

    public boolean isMeetingWithVoiceBridgeExist(String voiceBridge) {
        /*
         * Collection<Meeting> confs = meetings.values(); for (Meeting c :
         * confs) { if (voiceBridge == c.getVoiceBridge()) { return true; } }
         */return false;
    }

    public void send(String channel, String message) {
        messagingService.send(channel, message);
    }

    public void createdPolls(String meetingId, String title, String question,
            String questionType, ArrayList<String> answers) {
        messagingService.sendPolls(meetingId, title, question, questionType,
                answers);
    }

    public void endMeeting(String meetingId) {
        handle(new EndMeeting(meetingId));
    }

    private void processCreateBreakoutRoom(CreateBreakoutRoom message) {
        Map<String, String> params = new HashMap<String, String>();
        params.put("name", message.name);
        params.put("breakoutId", message.breakoutId);
        params.put("meetingID", message.parentId);
        params.put("isBreakout", "true");
        params.put("attendeePW", message.viewerPassword);
        params.put("moderatorPW", message.moderatorPassword);
        params.put("voiceBridge", message.voiceConfId);
        params.put("duration", message.durationInMinutes.toString());

        Meeting breakout = paramsProcessorUtil.processCreateParams(params);

        handleCreateMeeting(breakout);

        presDownloadService.downloadAndProcessDocument(
                message.defaultPresentationURL, breakout.getInternalId());
    }

    private void processEndBreakoutRoom(EndBreakoutRoom message) {
        processEndMeeting(new EndMeeting(message.breakoutId));
    }

    private void processEndMeeting(EndMeeting message) {
        messagingService.endMeeting(message.meetingId);

        Meeting m = getMeeting(message.meetingId);
        if (m != null) {
            m.setForciblyEnded(true);
            if (removeMeetingWhenEnded) {
                processRecording(m.getInternalId());
                destroyMeeting(m.getInternalId());
                meetings.remove(m.getInternalId());
                removeUserSessions(m.getInternalId());
            }
        }
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

                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("duration", m.getDuration());
                logData.put("record", m.isRecord());
                logData.put("isBreakout", m.isBreakout());
                logData.put("event", "meeting_started");
                logData.put("description", "Meeting has started.");

                Gson gson = new Gson();
                String logStr = gson.toJson(logData);
            } else {
                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("duration", m.getDuration());
                logData.put("record", m.isRecord());
                logData.put("isBreakout", m.isBreakout());
                logData.put("event", "meeting_restarted");
                logData.put("description", "Meeting has restarted.");

				Gson gson = new Gson();
				String logStr =  gson.toJson(logData);
				
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

            Map<String, Object> logData = new HashMap<String, Object>();
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

            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("meetingId", m.getInternalId());
            logData.put("externalMeetingId", m.getExternalId());
            logData.put("name", m.getName());
            logData.put("duration", m.getDuration());
            logData.put("record", m.isRecord());
            logData.put("event", "meeting_destroyed");
            logData.put("description", "Meeting has been destroyed.");

            Gson gson = new Gson();
            String logStr =  gson.toJson(logData);

            log.info("Meeting destroyed: data={}", logStr);

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
                    message.name, message.role, message.avatarURL);
            m.userJoined(user);

            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("meetingId", m.getInternalId());
            logData.put("externalMeetingId", m.getExternalId());
            logData.put("name", m.getName());
            logData.put("userId", message.userId);
            logData.put("externalUserId", user.getExternalUserId());
            logData.put("username", user.getFullname());
            logData.put("role", user.getRole());
            logData.put("event", "user_joined_message");
            logData.put("description", "User had joined the meeting.");
				
				Gson gson = new Gson();
		        String logStr =  gson.toJson(logData);
				
				log.info("User left meeting: data={}", logStr);
				
				return;
			}
			return;
		}

    private void userLeft(UserLeft message) {
        Meeting m = getMeeting(message.meetingId);
        if (m != null) {
            User user = m.userLeft(message.userId);
            if (user != null) {

                Map<String, Object> logData = new HashMap<String, Object>();
                logData.put("meetingId", m.getInternalId());
                logData.put("externalMeetingId", m.getExternalId());
                logData.put("name", m.getName());
                logData.put("userId", message.userId);
                logData.put("externalUserId", user.getExternalUserId());
                logData.put("username", user.getFullname());
                logData.put("role", user.getRole());
                logData.put("event", "user_left_message");
                logData.put("description", "User had left the meeting.");

                Gson gson = new Gson();
                String logStr = gson.toJson(logData);

                log.info("User left meeting: data={}", logStr);

                if (m.getNumUsers() == 0) {
                    // Last user the meeting. Mark this as the time
                    // the meeting ended.
                    m.setEndTime(System.currentTimeMillis());
                }

                Long userRegistered = m.userUnregistered(message.userId);
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
			if(user != null){
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
	
	public void setPresDownloadService(PresentationUrlDownloadService presDownloadService) {
	  this.presDownloadService = presDownloadService;
	}

    private void processStunTurnInfoRequested (StunTurnInfoRequested message) {
        Set<StunServer> stuns = stunTurnService.getStunServers();
        log.info("\nhere are the stuns:");
        for(StunServer s : stuns) {
            log.info("a stun: " + s.url);
        }
        Set<TurnEntry> turns = stunTurnService.getStunAndTurnServersFor(message.internalUserId);
        log.info("\nhere are the (" + turns.size() +") turns for internalUserId:" + message.internalUserId);
        for(TurnEntry t : turns) {
            log.info("a turn: " + t.url + "username/pass=" + t.username + '/' + t.password);
        }
        messagingService.sendStunTurnInfo(message.meetingId, message.internalUserId, stuns, turns);
    }


    public void userJoinedVoice(UserJoinedVoice message) {
        Meeting m = getMeeting(message.meetingId);
        if (m != null) {
            User user = m.getUserById(message.userId);
            if (user != null) {
                user.setVoiceJoined(true);
                return;
            }
            return;
        }
    }

    public void userLeftVoice(UserLeftVoice message) {
        Meeting m = getMeeting(message.meetingId);
        if (m != null) {
            User user = m.getUserById(message.userId);
            if (user != null) {
                user.setVoiceJoined(false);
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
                } else if (message instanceof RemoveExpiredMeetings) {
                    checkAndRemoveExpiredMeetings();
                } else if (message instanceof CreateMeeting) {
                    processCreateMeeting((CreateMeeting) message);
                } else if (message instanceof EndMeeting) {
                    processEndMeeting((EndMeeting) message);
                } else if (message instanceof RegisterUser) {
                    processRegisterUser((RegisterUser) message);
                }   else if (message instanceof CreateBreakoutRoom) {
                    processCreateBreakoutRoom((CreateBreakoutRoom) message);
                } else if (message instanceof EndBreakoutRoom) {
                    processEndBreakoutRoom((EndBreakoutRoom) message);
                } else if (message instanceof StunTurnInfoRequested) {
                    processStunTurnInfoRequested((StunTurnInfoRequested) message);
                } else if (message instanceof CreateBreakoutRoom) {
                    processCreateBreakoutRoom((CreateBreakoutRoom) message);
                } else if (message instanceof EndBreakoutRoom) {
                    processEndBreakoutRoom((EndBreakoutRoom) message);
                }
            }
        };

        runExec.execute(task);
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
        cleaner.stop();
        registeredUserCleaner.stop();
    }

    public void setDefaultMeetingCreateJoinDuration(int expiration) {
        this.defaultMeetingCreateJoinDuration = expiration;
    }

    public void setDefaultMeetingExpireDuration(int meetingExpiration) {
        this.defaultMeetingExpireDuration = meetingExpiration;
    }

    public void setRecordingService(RecordingService s) {
        recordingService = s;
    }

    public void setMessagingService(MessagingService mess) {
        messagingService = mess;
    }

    public void setExpiredMeetingCleanupTimerTask(ExpiredMeetingCleanupTimerTask c) {
        cleaner = c;
        cleaner.setMeetingService(this);
        cleaner.start();
    }

    public void setRemoveMeetingWhenEnded(boolean s) {
        removeMeetingWhenEnded = s;
    }

    public void setRegisteredUserCleanupTimerTask(RegisteredUserCleanupTimerTask c) {
        registeredUserCleaner = c;
        registeredUserCleaner.setMeetingService(this);
        registeredUserCleaner.start();
    }

    public void setStunTurnService(StunTurnService s) { stunTurnService = s; }
}
