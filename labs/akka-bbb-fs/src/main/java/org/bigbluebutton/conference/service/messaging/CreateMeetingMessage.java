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
	public final String moderatorPass;
	public final String viewerPass;
	public final Long createTime;
	public final String createDate;
	
	public CreateMeetingMessage(String id, String externalId, String name, Boolean record, String voiceBridge, 
			                        Long duration, Boolean autoStartRecording, 
			                        Boolean allowStartStopRecording, String moderatorPass,
			                        String viewerPass, Long createTime, String createDate) {
		this.id = id;
		this.externalId = externalId;
		this.name = name;
		this.record = record;
		this.voiceBridge = voiceBridge;
		this.duration = duration;	
		this.autoStartRecording = autoStartRecording;
		this.allowStartStopRecording = allowStartStopRecording;
		this.moderatorPass = moderatorPass;
		this.viewerPass = viewerPass;
		this.createTime = createTime;
		this.createDate = createDate;
	}
}
