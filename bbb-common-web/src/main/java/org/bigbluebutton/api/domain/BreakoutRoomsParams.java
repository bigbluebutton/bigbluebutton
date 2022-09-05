package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean record;
	public final Boolean privateChatEnabled;
	public final Boolean capture;

	public BreakoutRoomsParams(Boolean record, Boolean privateChatEnabled, Boolean capture) {
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
		this.capture = capture;
	}
}
