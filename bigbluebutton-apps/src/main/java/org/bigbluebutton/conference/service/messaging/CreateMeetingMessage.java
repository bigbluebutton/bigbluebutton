package org.bigbluebutton.conference.service.messaging;

public class CreateMeetingMessage implements IMessage {
	public static final String CREATE_MEETING_REQUEST_EVENT  = "create_meeting_request";
	public static final String VERSION = "0.0.1";
	
	public final String id;
	public final String name;
	public final Boolean record;
	public final String voiceBridge;
	public final Long duration;
	
	public CreateMeetingMessage(String id, String name, Boolean record, String voiceBridge, Long duration) {
		this.id = id;
		this.name = name;
		this.record = record;
		this.voiceBridge = voiceBridge;
		this.duration = duration;	
	}
}
