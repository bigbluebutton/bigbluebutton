package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean record;
	public final Boolean privateChatEnabled;
	public final Boolean bringBackSlidesEnabled;

	public BreakoutRoomsParams(Boolean record, Boolean privateChatEnabled, Boolean bringBackSlidesEnabled) {
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
		this.bringBackSlidesEnabled = bringBackSlidesEnabled;
	}
}
