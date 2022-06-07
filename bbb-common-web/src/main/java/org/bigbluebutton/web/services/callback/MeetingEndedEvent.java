package org.bigbluebutton.web.services.callback;

public class MeetingEndedEvent implements ICallbackEvent {
	private final String callbackUrl;
	public final String meetingid;
	public final String extMeetingid;
	public final String name;

	public MeetingEndedEvent(String mid, String extMid, String name, String callbackUrl) {
		this.callbackUrl = callbackUrl;
		this.meetingid = mid;
		this.extMeetingid = extMid;
		this.name = name;
	}

	public String getCallbackUrl() {
		return callbackUrl;
	}
}
