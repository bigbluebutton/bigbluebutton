package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean enabled;
	public final Boolean record;
	public final Boolean privateChatEnabled;

	public BreakoutRoomsParams(Boolean enabled, Boolean record, Boolean privateChatEnabled) {
		this.enabled = enabled;
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
	}
}
