package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean record;
	public final Boolean privateChatEnabled;
	public final Boolean captureNotes;
	public final Boolean captureSlides;
	public final String captureNotesFilename;
	public final String captureSlidesFilename;

	public BreakoutRoomsParams(Boolean record, Boolean privateChatEnabled, Boolean captureNotes, Boolean captureSlides, String captureNotesFilename, String captureSlidesFilename) {
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
		this.captureNotes = captureNotes;
		this.captureSlides = captureSlides;
		this.captureNotesFilename = captureNotesFilename;
		this.captureSlidesFilename = captureSlidesFilename;
	}
}
