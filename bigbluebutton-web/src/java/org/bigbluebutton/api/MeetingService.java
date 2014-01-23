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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.*;
import org.apache.commons.lang.RandomStringUtils;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Playback;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.web.services.ExpiredMeetingCleanupTimerTask;
import org.bigbluebutton.web.services.KeepAliveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MeetingService {
	private static Logger log = LoggerFactory.getLogger(MeetingService.class);
	
	private final ConcurrentMap<String, Meeting> meetings;	
	private final ConcurrentMap<String, UserSession> sessions;
	
	
	private int defaultMeetingExpireDuration = 1;	
	private int defaultMeetingCreateJoinDuration = 5;
	private RecordingService recordingService;
	private MessagingService messagingService;
	private ExpiredMeetingCleanupTimerTask cleaner;
	private boolean removeMeetingWhenEnded = false;
	private KeepAliveService keepAliveService;
	
	public MeetingService() {
		meetings = new ConcurrentHashMap<String, Meeting>();	
		sessions = new ConcurrentHashMap<String, UserSession>();
		
	}
	
	public void addUserSession(String token, UserSession user) {
		sessions.put(token, user);
	}
	
	public UserSession getUserSession(String token) {
		return sessions.get(token);
	}
	
	public UserSession removeUserSession(String token) {
		return sessions.remove(token);
	}
		
	/**
	 * Remove the meetings that have ended from the list of
	 * running meetings.
	 */
	public void removeExpiredMeetings() {
		log.info("Cleaning up expired meetings");
		for (Meeting m : meetings.values()) {
			if (m.hasExpired(defaultMeetingExpireDuration) ) {
				log.info("Removing expired meeting [id={} , name={}]", m.getInternalId(), m.getName());
				log.info("Expired meeting [start={} , end={}]", m.getStartTime(), m.getEndTime());
		  		if (m.isRecord() && m.getNumUsers()==0) {
		  			log.debug("[" + m.getInternalId() + "] is recorded. Process it.");		  			
		  			processRecording(m.getInternalId());
		  		}
		  		
		  		destroyMeeting(m.getInternalId());
		  		
				meetings.remove(m.getInternalId());
				
				continue;
			}
			
			if (m.wasNeverStarted(defaultMeetingCreateJoinDuration)) {
				log.info("Removing non-joined meeting [{} - {}]", m.getInternalId(), m.getName());
				destroyMeeting(m.getInternalId());
				
				meetings.remove(m.getInternalId());
				continue;
			}
			
			if (m.hasExceededDuration()) {
				log.info("Forcibly ending meeting [{} - {}]", m.getInternalId(), m.getName());
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
		log.debug("Storing Meeting with internal id:" + m.getInternalId());
		meetings.put(m.getInternalId(), m);
		if (m.isRecord()) {
			Map<String,String> metadata = new LinkedHashMap<String,String>();
			metadata.putAll(m.getMetadata());
			//TODO: Need a better way to store these values for recordings
			metadata.put("meetingId", m.getExternalId());
			metadata.put("meetingName", m.getName());
			
			messagingService.recordMeetingInfo(m.getInternalId(), metadata);
		}
		
		messagingService.createMeeting(m.getInternalId(), m.isRecord(), m.getTelVoice());
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
		if(meetingId == null)
			return null;
		for (String key : meetings.keySet()) {
			if (key.startsWith(meetingId))
				return (Meeting) meetings.get(key);
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
		for(Recording r:olds){
			if(!map.containsKey(r.getId())){
				Map<String,String> meta= r.getMetadata();
				String mid = meta.remove("meetingId");
				String name = meta.remove("meetingName");
				
				r.setMeetingID(mid);
				r.setName(name);

				ArrayList<Playback> plays=new ArrayList<Playback>();
				
				plays.add(new Playback(r.getPlaybackFormat(), r.getPlaybackLink(), getDurationRecording(r.getPlaybackDuration(), r.getEndTime(), r.getStartTime())));
				r.setPlaybacks(plays);
				map.put(r.getId(), r);
			}
			else{
				Recording rec=map.get(r.getId());
				rec.getPlaybacks().add(new Playback(r.getPlaybackFormat(), r.getPlaybackLink(), getDurationRecording(r.getPlaybackDuration(), r.getEndTime(), r.getStartTime())));
			}
		}
		
		return map;
	}
	
	private int getDurationRecording(String playbackDuration, String end, String start) {
		int duration;
		try{
			if (!playbackDuration.equals("")) {
				duration = (int)Math.ceil((Long.parseLong(playbackDuration))/60000.0);
			} else {
				duration = (int)Math.ceil((Long.parseLong(end) - Long.parseLong(start))/60000.0);
			}
		}catch(Exception e){
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
	
	public void setRemoveMeetingWhenEnded(boolean s) {
		removeMeetingWhenEnded = s;
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
		messagingService.endMeeting(meetingId);
		
		Meeting m = getMeeting(meetingId);
		if (m != null) {
			m.setForciblyEnded(true);
			if (removeMeetingWhenEnded)
			{
				if (m.isRecord()) {
					log.debug("[" + m.getInternalId() + "] is recorded. Process it.");		  			
					processRecording(m.getInternalId());
				}
				meetings.remove(m.getInternalId());
			}
		}else{
			log.debug("endMeeting - meeting doesn't exist: " + meetingId);
		}
	}
	
	public void addUserCustomData(String meetingId, String userID, Map<String,String> userCustomData){
		Meeting m = getMeeting(meetingId);
		if(m != null){
			m.addUserCustomData(userID,userCustomData);
		}
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
		messagingService.addListener(new MeetingMessageListener());
		messagingService.start();
	}
	
	public void setExpiredMeetingCleanupTimerTask(ExpiredMeetingCleanupTimerTask c) {
		cleaner = c;
		cleaner.setMeetingService(this);
		cleaner.start();
	}

	public void setKeepAliveService(KeepAliveService keepAlive){
		this.keepAliveService = keepAlive;
	}
	
	/**
	 * Class that listens for messages from bbb-apps.
	 * @author Richard Alam
	 *
	 */
	private class MeetingMessageListener implements MessageListener {
		@Override
		public void meetingStarted(String meetingId) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				if(m.getStartTime() == 0){
					log.debug("Setting meeting " + meetingId + " started time");
					m.setStartTime(System.currentTimeMillis());
				}else{
					log.debug("The meeting " + meetingId + " has been started again...");
				}
				m.setEndTime(0);
				return;
			}
			log.warn("The meeting " + meetingId + " doesn't exist");
		}

		@Override
		public void meetingEnded(String meetingId) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				log.debug("Setting meeting " + meetingId + " end time");
				m.setEndTime(System.currentTimeMillis());
				return;
			}
			log.warn("The meeting " + meetingId + " doesn't exist");
		}

		@Override
		public void userJoined(String meetingId, String internalUserId, String externalUserId, String name, String role) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				User user = new User(internalUserId, externalUserId, name, role);
				m.userJoined(user);
				log.debug("New user in meeting " + meetingId + ":" + user.getFullname());
				return;
			}
			log.warn("The meeting " + meetingId + " doesn't exist");
		}

		@Override
		public void userLeft(String meetingId, String internalUserId) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				User user = m.userLeft(internalUserId);
				if(user != null){
					log.debug("User removed from meeting " + meetingId + ":" + user.getFullname());
					return;
				}
				log.warn("The participant " + internalUserId + " doesn't exist in the meeting " + meetingId);
				return;
			}
			log.warn("The meeting " + meetingId + " doesn't exist");
		}
		
		@Override
		public void updatedStatus(String meetingId, String internalUserId, String status, String value) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				User user = m.getUserById(internalUserId);
				if(user != null){
					user.setStatus(status, value);
					log.debug("Setting new status value in meeting " + meetingId + " for participant:"+user.getFullname());
					return;
				}
				log.warn("The participant " + internalUserId + " doesn't exist in the meeting " + meetingId);
				return;
			}
			log.warn("The meeting " + meetingId + " doesn't exist");
		}

		@Override
		public void keepAliveReply(String aliveId){
			keepAliveService.keepAliveReply(aliveId);
		}
	}
	
}
