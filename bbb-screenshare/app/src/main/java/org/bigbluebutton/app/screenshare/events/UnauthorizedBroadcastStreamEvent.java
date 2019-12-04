package org.bigbluebutton.app.screenshare.events;

public class UnauthorizedBroadcastStreamEvent implements IEvent {
	public final String meetingId;
	public final String streamId;
	public final String connId;
	public final String scope;

	public UnauthorizedBroadcastStreamEvent(String meetingId, String streamId, String connId, String scope) {
		this.meetingId = meetingId;
		this.streamId = streamId;
		this.connId = connId;
		this.scope = scope;
	}
}
