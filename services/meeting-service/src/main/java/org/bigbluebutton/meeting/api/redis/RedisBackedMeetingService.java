package org.bigbluebutton.meeting.api.redis;

import org.bigbluebutton.meeting.api.IMeetingService;

public class RedisBackedMeetingService implements IMeetingService {

	@Override
	public boolean createMeeting() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean endMeeting(String meetingID) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public String joinUser() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void removeExpiredMeetings() {
		// TODO Auto-generated method stub

	}

	@Override
	public void destroyMeeting(String meetingID) {
		// TODO Auto-generated method stub

	}

	@Override
	public String addSubscription(String meetingId, String event,
			String callbackURL) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean removeSubscription(String meetingId, String subscriptionId) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void setRemoveMeetingWhenEnded(boolean s) {
		// TODO Auto-generated method stub

	}

	@Override
	public void processRecording(String meetingId) {
		// TODO Auto-generated method stub

	}

}
