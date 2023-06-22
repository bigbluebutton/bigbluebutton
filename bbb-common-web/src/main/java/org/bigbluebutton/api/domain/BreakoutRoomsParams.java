package org.bigbluebutton.api.domain;

public class BreakoutRoomsParams {
	public final Boolean record;
	public final Boolean privateChatEnabled;
	public final Boolean captureNotes;
	public final Boolean captureSlides;
	public final String captureNotesFilename;
	public final String captureSlidesFilename;
	public final Boolean includeMods;

	public BreakoutRoomsParams(Boolean record, Boolean privateChatEnabled, Boolean captureNotes, Boolean captureSlides, String captureNotesFilename, String captureSlidesFilename, Boolean includeMods) {
		this.record = record;
		this.privateChatEnabled = privateChatEnabled;
		this.includeMods = includeMods;
		this.captureNotes = captureNotes;
		this.captureSlides = captureSlides;
		this.captureNotesFilename = captureNotesFilename;
		this.captureSlidesFilename = captureSlidesFilename;
	}
}
