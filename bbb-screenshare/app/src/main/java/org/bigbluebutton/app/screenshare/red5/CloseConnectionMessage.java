package org.bigbluebutton.app.screenshare.red5;

public class CloseConnectionMessage implements ClientMessage {

	public final String meetingId;
	public final String streamId;
	public final String connId;
	public final String scope;

	public CloseConnectionMessage(String meetingId, String streamId, String connId, String scope) {
		this.meetingId = meetingId;
		this.streamId = streamId;
		this.connId = connId;
		this.scope = scope;
	}
}
