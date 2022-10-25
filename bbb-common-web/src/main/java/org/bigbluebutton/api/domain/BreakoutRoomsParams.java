package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean record;
	public final Boolean privateChatEnabled;
	public final Boolean captureNotes;

	public BreakoutRoomsParams(Boolean record, Boolean privateChatEnabled, Boolean captureNotes) {
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
		this.captureNotes = captureNotes;
	}
}
