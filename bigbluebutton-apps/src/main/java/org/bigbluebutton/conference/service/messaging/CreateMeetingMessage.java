package org.bigbluebutton.conference.service.messaging;

public class CreateMeetingMessage implements IMessage {
	public static final String CREATE_MEETING_REQUEST_EVENT  = "create_meeting_request";
	public static final String VERSION = "0.0.1";
	
	public final String id;
	public final String externalId;
	public final String name;
	public final Boolean record;
	public final String voiceBridge;
	public final Long duration;
	public final Boolean autoStartRecording;
	public final Boolean allowStartStopRecording;
	
	public CreateMeetingMessage(String id, String externalId, String name, Boolean record, String voiceBridge, 
			                        Long duration, Boolean autoStartRecording, 
			                        Boolean allowStartStopRecording) {
		this.id = id;
		this.externalId = externalId;
		this.name = name;
		this.record = record;
		this.voiceBridge = voiceBridge;
		this.duration = duration;	
		this.autoStartRecording = autoStartRecording;
		this.allowStartStopRecording = allowStartStopRecording;
	}
}
