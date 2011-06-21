package org.bigbluebutton.api;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.*;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.web.services.ExpiredMeetingCleanupTimerTask;
import org.bigbluebutton.web.services.IDynamicConferenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.lang.StringUtils;

public class MeetingServiceImp implements MeetingService {
	private static Logger log = LoggerFactory.getLogger(MeetingServiceImp.class);
	
	private final ConcurrentMap<String, Meeting> meetings;
	
	private int minutesElapsedBeforeMeetingExpiration = 60;
	
	private IDynamicConferenceService dynConfService;
	private MessagingService messagingService;
	private ExpiredMeetingCleanupTimerTask cleaner;
	
	public MeetingServiceImp() {
		meetings = new ConcurrentHashMap<String, Meeting>();		
	}
	
	/**
	 * Remove the meetings that have ended from the list of
	 * running meetings.
	 */
	@Override
	public void removeExpiredMeetings() {
		for (Meeting m : meetings.values()) {
			if (m.hasExpired(minutesElapsedBeforeMeetingExpiration) || m.wasNeverStarted(minutesElapsedBeforeMeetingExpiration)) {
				log.info("Removing expired meeting [{} - {}]", m.getInternalId(), m.getName());
				meetings.remove(m.getInternalId());
				continue;
			}
			
			if (m.hasExceededDuration()) {
				log.info("Ending meeting [{} - {}]", m.getInternalId(), m.getName());
				m.setForciblyEnded(true);
				endMeeting(m.getInternalId());
			}
		}
	}
	
	public Collection<Meeting> getMeetings() {
		log.debug("The number of meetings are: " + meetings.size());
		return meetings.isEmpty() ? Collections.<Meeting>emptySet() : Collections.unmodifiableCollection(meetings.values());
	}
	
	public void storeMeeting(Meeting m) {
		log.debug("Storing Meeting with internal id:" + m.getInternalId());
		meetings.put(m.getInternalId(), m);
	}

	public Meeting getMeeting(String meetingId) {
		if (StringUtils.isEmpty(meetingId)) {
			return null;
		}
		
		for (String key : meetings.keySet()) {
			if (key.startsWith(meetingId))
				return (Meeting) meetings.get(key);
		}
		
		return null;
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
	
	public void endMeeting(String meetingId) {
		
		messagingService.endMeeting(meetingId);
	}
			
	public void setMinutesElapsedBeforeMeetingExpiration(int minutes) {
		minutesElapsedBeforeMeetingExpiration = minutes;
	}

	public void setDynamicConferenceService(IDynamicConferenceService s) {
		dynConfService = s;
		s.setMeetingService((MeetingService) this);
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
				m.setStartTime(System.currentTimeMillis());
				log.debug("Setting meeting started time");
			}
		}

		@Override
		public void meetingEnded(String meetingId) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				m.setEndTime(System.currentTimeMillis());
				log.debug("Setting meeting end time");
			}
		}

		@Override
		public void userJoined(String meetingId, String userId, String name, String role) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				User user = new User(userId, name, role);
				m.userJoined(user);
				log.debug("New user in meeting:"+user.getFullname());
			}
		}

		@Override
		public void userLeft(String meetingId, String userId) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				User user = m.userLeft(userId);
				log.debug("User removed from meeting:" + user.getFullname());
			}
		}
		
		@Override
		public void updatedStatus(String meetingId, String userId, String status, String value) {
			Meeting m = getMeeting(meetingId);
			if (m != null) {
				User user = m.getUserById(userId);
				user.setStatus(status, value);
				log.debug("Setting new status value for participant:"+user.getFullname());
			}
		}
	}
	
}