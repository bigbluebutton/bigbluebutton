package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean record;
	public final Boolean privateChatEnabled;

	public BreakoutRoomsParams(Boolean record, Boolean privateChatEnabled) {
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
	}
}
