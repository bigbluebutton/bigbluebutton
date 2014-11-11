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

import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.*;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Playback;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.MessagingConstants;
import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.api.messaging.ReceivedMessage;
import org.bigbluebutton.api.messaging.messages.CreateMeeting;
import org.bigbluebutton.api.messaging.messages.EndMeeting;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.bigbluebutton.api.messaging.messages.MeetingEnded;
import org.bigbluebutton.api.messaging.messages.MeetingStarted;
import org.bigbluebutton.api.messaging.messages.RegisterUser;
import org.bigbluebutton.api.messaging.messages.RemoveExpiredMeetings;
import org.bigbluebutton.api.messaging.messages.UserJoined;
import org.bigbluebutton.api.messaging.messages.UserLeft;
import org.bigbluebutton.api.messaging.messages.UserStatusChanged;
import org.bigbluebutton.web.services.ExpiredMeetingCleanupTimerTask;
import org.bigbluebutton.web.services.KeepAliveService;
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
		
	private int defaultMeetingExpireDuration = 1;	
	private int defaultMeetingCreateJoinDuration = 5;
	private RecordingService recordingService;
	private MessagingService messagingService;
	private ExpiredMeetingCleanupTimerTask cleaner;
	private boolean removeMeetingWhenEnded = false;

	public MeetingService() {
		meetings = new ConcurrentHashMap<String, Meeting>(8, 0.9f, 1);	
		sessions = new ConcurrentHashMap<String, UserSession>(8, 0.9f, 1);		
	}
	
	public void addUserSession(String token, UserSession user) {
		log.debug("Adding user [" + user.fullname + "] token=[" + token + "] to meeting [" + user.meetingID + "]");
		sessions.put(token, user);
	}
	
	public void registerUser(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken) {
		handle(new RegisterUser(meetingID, internalUserId, fullname, role, externUserID, authToken));
	}
	
	public UserSession getUserSession(String token) {
		return sessions.get(token);
	}
	
	public UserSession removeUserSession(String token) {
		log.debug("Removing user token [" + token + "]");
		UserSession user = sessions.remove(token);
		if (user != null) {
			log.debug("Found user [" + user.fullname + "] token=[" + token + "] to meeting [" + user.meetingID + "]");
		}
		return user;
	}
		
	/**
	 * Remove the meetings that have ended from the list of
	 * running meetings.
	 */
	public void removeExpiredMeetings() {
		log.debug("Trigger cleaning up expired meetings");
    handle(new RemoveExpiredMeetings());
	}
	
	private void kickOffProcessingOfRecording(Meeting m) {
  	if (m.isRecord() && m.getNumUsers() == 0) {
  		log.info("Kick-off processing of recording for meeting [id={} , name={}]", m.getInternalId(), m.getName());		
  		
  		Map<String, Object> logData = new HashMap<String, Object>();
  		logData.put("meetingId", m.getInternalId());
  		logData.put("externalMeetingId", m.getExternalId());
  		logData.put("name", m.getName());
  		logData.put("event", "kick_off_ingest_and_processing");
  		logData.put("description", "Start processing of recording.");
  		
  		Gson gson = new Gson();
      String logStr =  gson.toJson(logData);
  		
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
		log.debug("Cleaning up user sessions for meeting [" + meetingId + "]");
		Iterator<Map.Entry<String, UserSession>> iterator = sessions.entrySet().iterator();
		while(iterator.hasNext()){
		   Map.Entry<String, UserSession> entry = iterator.next();		   
		   UserSession userSession = entry.getValue();
		   log.debug("Got user [" + userSession.fullname + "] from meeting [" + userSession.conferencename + "]");
		   if (userSession.meetingID.equals(meetingId)) {
		  	 log.debug("Removing user [" + userSession.fullname + "] from meeting [" + userSession.conferencename + "]");
		  	 iterator.remove();
		   } else {
		  	 log.debug("Not Removing user [" + userSession.fullname + "] from meeting [" + userSession.conferencename + "]");
		   }
		}
	}
	
	private void checkAndRemoveExpiredMeetings() {
		log.debug("Cleaning up expired meetings");
		for (Meeting m : meetings.values()) {
			if (m.hasExpired(defaultMeetingExpireDuration) ) {
				log.info("Meeting [id={} , name={}] has expired.", m.getInternalId(), m.getName());
				
	  		Map<String, Object> logData = new HashMap<String, Object>();
	  		logData.put("meetingId", m.getInternalId());
	  		logData.put("externalMeetingId", m.getExternalId());
	  		logData.put("name", m.getName());
	  		logData.put("event", "removing_meeting");
	  		logData.put("description", "Meeting has expired.");
	  		
	  		Gson gson = new Gson();
	      String logStr =  gson.toJson(logData);
	  		
	  		log.info("Removing meeting: data={}", logStr);
	  		
				processMeetingForRemoval(m);
				continue;
			} else {
				log.debug("Meeting [id={} , name={}] has not expired yet.", m.getInternalId(), m.getName());
			}
			
			if (m.isForciblyEnded()) {
				log.info("Meeting [id={} , name={}] has been forcefully ended.", m.getInternalId(), m.getName());
				
	  		Map<String, Object> logData = new HashMap<String, Object>();
	  		logData.put("meetingId", m.getInternalId());
	  		logData.put("externalMeetingId", m.getExternalId());
	  		logData.put("name", m.getName());
	  		logData.put("event", "removing_meeting");
	  		logData.put("description", "Meeting forcefully ended.");
	  		
	  		Gson gson = new Gson();
	      String logStr =  gson.toJson(logData);
	  		
	  		log.info("Removing meeting: data={}", logStr);
				processMeetingForRemoval(m);			
				continue;
			}
			
			if (m.wasNeverJoined(defaultMeetingCreateJoinDuration)) {
				log.info("No user has joined the meeting [id={} , name={}]. Removing it.", m.getInternalId(), m.getName());
				
	  		Map<String, Object> logData = new HashMap<String, Object>();
	  		logData.put("meetingId", m.getInternalId());
	  		logData.put("externalMeetingId", m.getExternalId());
	  		logData.put("name", m.getName());
	  		logData.put("event", "removing_meeting");
	  		logData.put("description", "Meeting has not been joined.");
	  		
	  		Gson gson = new Gson();
	      String logStr =  gson.toJson(logData);
	  		
	  		log.info("Removing meeting: data={}", logStr);
	  		
				destroyMeeting(m.getInternalId());			
				meetings.remove(m.getInternalId());
				continue;
			}
			
			if (m.hasExceededDuration()) {
				log.info("Meeting [id={} , name={}] has ran past duration. Ending it.", m.getInternalId(), m.getName());
				
	  		Map<String, Object> logData = new HashMap<String, Object>();
	  		logData.put("meetingId", m.getInternalId());
	  		logData.put("externalMeetingId", m.getExternalId());
	  		logData.put("name", m.getName());
	  		logData.put("event", "removing_meeting");
	  		logData.put("description", "Meeting exceeded duration.");
	  		
	  		Gson gson = new Gson();
	      String logStr =  gson.toJson(logData);
	  		
	  		log.info("Removing meeting: data={}", logStr);
	  		
				endMeeting(m.getInternalId());
			}			
		}		
	}
	
	private void destroyMeeting(String meetingID) {
		messagingService.destroyMeeting(meetingID);
	}
	
	public Collection<Meeting> getMeetings() {
		log.debug("The number of meetings are: " + meetings.size());
		return meetings.isEmpty() ? Collections.<Meeting>emptySet() : Collections.unmodifiableCollection(meetings.values());
	}
	
	public void createMeeting(Meeting m) {
    handle(new CreateMeeting(m));
//		handleCreateMeeting(m);
	}

	private void handleCreateMeeting(Meeting m) {
		log.info("Storing Meeting with internalId=[" + m.getInternalId() + "], externalId=[" 
	            + m.getExternalId() + "], name=[" + m.getName() + "], duration=[" 
				      + m.getDuration() + "], record=[" + m.isRecord() + "]");

		meetings.put(m.getInternalId(), m);
		if (m.isRecord()) {
			Map<String,String> metadata = new LinkedHashMap<String,String>();
			metadata.putAll(m.getMetadata());
			//TODO: Need a better way to store these values for recordings
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
    String logStr =  gson.toJson(logData);
		
		log.info("Create meeting: data={}", logStr);
		
		messagingService.createMeeting(m.getInternalId(), m.getExternalId(), m.getName(), m.isRecord(), 
				 m.getTelVoice(), m.getDuration(), m.getAutoStartRecording(), m.getAllowStartStopRecording());			
	}
	
	private void processCreateMeeting(CreateMeeting message) {
		handleCreateMeeting(message.meeting);
	}
	
	private void processRegisterUser(RegisterUser message) {
		messagingService.registerUser(message.meetingID, message.internalUserId, message.fullname, message.role, message.externUserID, message.authToken);
	}
	
	public String addSubscription(String meetingId, String event, String callbackURL){
		log.debug("Add a new subscriber");
		String sid = messagingService.storeSubscription(meetingId, event, callbackURL);
		return sid;
	}

	public boolean removeSubscription(String meetingId, String subscriptionId){
		return messagingService.removeSubscription(meetingId, subscriptionId);
	}

	public List<Map<String,String>> listSubscriptions(String meetingId){
		return messagingService.listSubscriptions(meetingId);
	}

	public Meeting getMeeting(String meetingId) {
		if (meetingId == null)
			return null;
		for (String key : meetings.keySet()) {
			if (key.startsWith(meetingId))
				return (Meeting) meetings.get(key);
		}
		
		return null;
	}

	public Collection<Meeting> getMeetingsWithId(String meetingId) {
		if (meetingId == null) return Collections.<Meeting>emptySet();
		
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
				if (! m.isForciblyEnded()) return m;
			}
		}
		
		return null;
	} 
	
	public HashMap<String,Recording> getRecordings(ArrayList<String> idList) {
		//TODO: this method shouldn't be used 
		HashMap<String,Recording> recs= reorderRecordings(recordingService.getRecordings(idList));
		return recs;
	}
	
	public HashMap<String,Recording> reorderRecordings(ArrayList<Recording> olds){
		HashMap<String,Recording> map= new HashMap<String, Recording>();
		for (Recording r:olds) {
			if (!map.containsKey(r.getId())) {
				Map<String,String> meta= r.getMetadata();
				String mid = meta.remove("meetingId");
				String name = meta.remove("meetingName");
				
				r.setMeetingID(mid);
				r.setName(name);

				ArrayList<Playback> plays = new ArrayList<Playback>();
				
				plays.add(new Playback(r.getPlaybackFormat(), r.getPlaybackLink(), 
						getDurationRecording(r.getPlaybackDuration(), 
								r.getEndTime(), r.getStartTime()),
						r.getPlaybackExtensions()));
				r.setPlaybacks(plays);
				map.put(r.getId(), r);
			} else {
				Recording rec = map.get(r.getId());
				rec.getPlaybacks().add(new Playback(r.getPlaybackFormat(), r.getPlaybackLink(), 
						getDurationRecording(r.getPlaybackDuration(), 
								r.getEndTime(), r.getStartTime()),
						r.getPlaybackExtensions()));
			}
		}
		
		return map;
	}
	
	private int getDurationRecording(String playbackDuration, String end, String start) {
		int duration;
		try {
			if (!playbackDuration.equals("")) {
				duration = (int)Math.ceil((Long.parseLong(playbackDuration))/60000.0);
			} else {
				duration = (int)Math.ceil((Long.parseLong(end) - Long.parseLong(start))/60000.0);
			}
		} catch(Exception e){
			log.debug(e.getMessage());
			duration = 0;
		}
		
		return duration;
	}
	
	public boolean existsAnyRecording(ArrayList<String> idList){
		return recordingService.existAnyRecording(idList);
	}
	
	public void setPublishRecording(ArrayList<String> idList,boolean publish){
		for(String id:idList){
			recordingService.publish(id,publish);
		}
	}
	
	public void deleteRecordings(ArrayList<String> idList){
		for(String id:idList){
			recordingService.delete(id);
		}
	}
	
	public void processRecording(String meetingId) {
		log.debug("Process recording for [{}]", meetingId);
		recordingService.startIngestAndProcessing(meetingId);
	}
		
	public boolean isMeetingWithVoiceBridgeExist(String voiceBridge) {
/*		Collection<Meeting> confs = meetings.values();
		for (Meeting c : confs) {
	        if (voiceBridge == c.getVoiceBridge()) {
	        	return true;
	        }
		}
*/		return false;
	}
	
	public void send(String channel, String message) {
		messagingService.send(channel, message);
	}

	public void createdPolls(String meetingId, String title, String question, String questionType, ArrayList<String> answers){
		messagingService.sendPolls(meetingId, title, question, questionType, answers);
	}
	
	public void endMeeting(String meetingId) {		
		log.info("Received request to end meeting=[{}]", meetingId);
    handle(new EndMeeting(meetingId));
	}
	
	private void processEndMeeting(EndMeeting message) {
		log.info("Received EndMeeting request from the API for meeting=[{}]", message.meetingId);
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
		} else {
			log.debug("endMeeting - meeting doesn't exist: " + message.meetingId);
		}		
	}
	
	public void addUserCustomData(String meetingId, String userID, Map<String,String> userCustomData){
		Meeting m = getMeeting(meetingId);
		if (m != null){
			m.addUserCustomData(userID, userCustomData);
		}
	}

	private void meetingStarted(MeetingStarted message) {
		log.debug("Meeting [{}] has started.", message.meetingId);
		Meeting m = getMeeting(message.meetingId);
		if (m != null) {
			if (m.getStartTime() == 0) {
				long now = System.currentTimeMillis();
				log.info("Meeting [{}] has started on [{}]", message.meetingId, now);
				m.setStartTime(now);
				
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", m.getInternalId());
				logData.put("externalMeetingId", m.getExternalId());
				logData.put("name", m.getName());
				logData.put("duration", m.getDuration());
				logData.put("record", m.isRecord());
				logData.put("event", "meeting_started");
				logData.put("description", "Meeting has started.");
				
				Gson gson = new Gson();
		    String logStr =  gson.toJson(logData);
				
				log.info("Meeting started: data={}", logStr);
				
			} else {
				log.debug("The meeting [{}] has been started again...", message.meetingId);
				
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", m.getInternalId());
				logData.put("externalMeetingId", m.getExternalId());
				logData.put("name", m.getName());
				logData.put("duration", m.getDuration());
				logData.put("record", m.isRecord());
				logData.put("event", "meeting_restarted");
				logData.put("description", "Meeting has restarted.");
				
				Gson gson = new Gson();
		    String logStr =  gson.toJson(logData);
				
				log.info("Meeting restarted: data={}", logStr);
			}
			return;
		}
		log.warn("The meeting [{}] doesn't exist", message.meetingId);
	}

	private void meetingEnded(MeetingEnded message) {
		log.debug("Meeting [{}] has ended.", message.meetingId);
		Meeting m = getMeeting(message.meetingId);
		if (m != null) {
			long now = System.currentTimeMillis();
			log.debug("Meeting [{}] end time [{}].", message.meetingId, now);
			m.setEndTime(now);
			
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", m.getInternalId());
			logData.put("externalMeetingId", m.getExternalId());
			logData.put("name", m.getName());
			logData.put("duration", m.getDuration());
			logData.put("record", m.isRecord());
			logData.put("event", "meeting_ended");
			logData.put("description", "Meeting has ended.");
			
			Gson gson = new Gson();
	    String logStr =  gson.toJson(logData);
			
			log.info("Meeting ended: data={}", logStr);
			
			return;
		}
		log.warn("The meeting " + message.meetingId + " doesn't exist");
	}

	private void userJoined(UserJoined message) {
		log.debug("User joined in meeting[{}]", message.meetingId);
		Meeting m = getMeeting(message.meetingId);
		if (m != null) {
			User user = new User(message.userId, message.externalUserId, message.name, message.role);
			m.userJoined(user);
			log.info("New user in meeting [" + message.meetingId + "] user [" + user.getFullname() + "]");
			
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", m.getInternalId());
			logData.put("externalMeetingId", m.getExternalId());
			logData.put("name", m.getName());
			logData.put("userId", message.userId);
			logData.put("externalUserId", user.getExternalUserId());
			logData.put("username", user.getFullname());
			logData.put("role", user.getRole());			
			logData.put("event", "user_joined_meeting");
			logData.put("description", "User had joined the meeting.");
			
			Gson gson = new Gson();
	    String logStr =  gson.toJson(logData);
			
			log.info("User joined meeting: data={}", logStr);
			
			return;
		}
		log.warn("The meeting " + message.meetingId + " doesn't exist");
	}

	private void userLeft(UserLeft message) {
		log.debug("User left from meeting[{}]", message.meetingId);
		Meeting m = getMeeting(message.meetingId);
		if (m != null) {
			User user = m.userLeft(message.userId);
			if(user != null){
				log.info("User removed from meeting [" + message.meetingId + "] user [" + user.getFullname() + "]");
				
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", m.getInternalId());
				logData.put("externalMeetingId", m.getExternalId());
				logData.put("name", m.getName());
				logData.put("userId", message.userId);
				logData.put("externalUserId", user.getExternalUserId());
				logData.put("username", user.getFullname());
				logData.put("role", user.getRole());			
				logData.put("event", "user_joined_meeting");
				logData.put("description", "User had joined the meeting.");
				
				Gson gson = new Gson();
		    String logStr =  gson.toJson(logData);
				
				log.info("User left meeting: data={}", logStr);
				
				return;
			}
			log.warn("The participant " + message.userId + " doesn't exist in the meeting " + message.meetingId);
			return;
		}
		log.warn("The meeting " + message.meetingId + " doesn't exist");
	}
		
	private void updatedStatus(UserStatusChanged message) {
		Meeting m = getMeeting(message.meetingId);
		if (m != null) {
			User user = m.getUserById(message.userId);
			if(user != null){
				user.setStatus(message.status, message.value);
				log.info("Setting new status value in meeting " + message.meetingId + " for participant:" + user.getFullname());
				return;
			}
			log.warn("The participant " + message.userId + " doesn't exist in the meeting " + message.meetingId);
			return;
		}
		log.warn("The meeting " + message.meetingId + " doesn't exist");
	}

	private void processMessage(final IMessage message) {
		Runnable task = new Runnable() {
	    public void run() {
	  		if (message instanceof MeetingDestroyed) {
	  			
	  		} else if (message instanceof MeetingStarted) {
	  			meetingStarted((MeetingStarted)message);
	  		} else if (message instanceof MeetingEnded) {
	  			log.info("Processing meeting ended request.");
	  			meetingEnded((MeetingEnded)message);
	  		} else if (message instanceof UserJoined) {
	  			log.info("Processing user joined message.");
	        userJoined((UserJoined)message);
	  		} else if (message instanceof UserLeft) {
	  			log.info("Processing user left message.");
	  			userLeft((UserLeft)message);
	  		} else if (message instanceof UserStatusChanged) {
	  			updatedStatus((UserStatusChanged)message);
	  		} else if (message instanceof RemoveExpiredMeetings) {
	  			checkAndRemoveExpiredMeetings();
	  		} else if (message instanceof CreateMeeting) {
	  			processCreateMeeting((CreateMeeting)message);
	  		} else if (message instanceof EndMeeting) {
	  			log.info("Processing end meeting request.");
	  			processEndMeeting((EndMeeting)message);
	  		} else if (message instanceof RegisterUser) {
	  			processRegisterUser((RegisterUser) message);
	  		}	
	    }
		};
		
		runExec.execute(task);
	}

	@Override
  public void handle(IMessage message) {
			receivedMessages.add(message);    
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
			    	  	log.error("Handling unexpected exception [{}]", e.toString());
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
}
