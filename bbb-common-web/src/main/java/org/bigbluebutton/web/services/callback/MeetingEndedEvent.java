package org.bigbluebutton.web.services.callback;

public class MeetingEndedEvent implements ICallbackEvent {
	private final String callbackUrl;

	public MeetingEndedEvent(String callbackUrl) {
		this.callbackUrl = callbackUrl;
	}

	public String getCallbackUrl() {
		return callbackUrl;
	}
}
