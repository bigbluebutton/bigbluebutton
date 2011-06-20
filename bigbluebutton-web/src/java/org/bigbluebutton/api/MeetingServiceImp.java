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
	
	@Override
	public void cleanupOldMeetings() {
		log.debug("Cleaning out old conferences");
		for (Meeting m : meetings.values()) {
			boolean remove = false;
			if (m.isRunning()) {
				log.debug( "Meeting [" + m.getInternalId() + "] is running - not cleaning it out");
				// won't remove one that's running
				continue;
			}
			
			long now = System.currentTimeMillis();
			long millisSinceStored = now - m.getCreateTime();
			long millisSinceEnd = now - m.getEndTime();
			
			if (m.getStartTime() > 0 && millisSinceEnd > (minutesElapsedBeforeMeetingExpiration * 60000)) {
				log.debug("Removing meeting because it started, ended, and is past the max expiration");
				remove = true;
			} else if (m.getEndTime() > 0 && millisSinceStored > (minutesElapsedBeforeMeetingExpiration * 60000)) {
				log.debug("Removing meeting because it was stored, but never started [stored " + millisSinceStored + " millis ago]");
				remove = true;
			}
			
			if (remove) {
				log.debug("Removing meeting [" + m.getInternalId() + "]");
				meetings.remove(m.getInternalId());
			} else {
				log.debug("Not removing meeting [" + m.getInternalId() + "]");
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