package org.bigbluebutton.api.messaging.converters.messages;

import java.util.Map;

public class CreateMeetingMessage {
	public static final String CREATE_MEETING_REQUEST_EVENT  = "create_meeting_request";
	public static final String VERSION = "0.0.1";
	
	public final String id;
	public final String externalId;
	public final String name;
	public final Boolean record;
	public final String voiceBridge;
	public final Long duration;
	public boolean autoStartRecording;
	public boolean allowStartStopRecording;
	public boolean webcamsOnlyForModerator;
	public final String moderatorPass;
	public final String viewerPass;
	public final Long createTime;
	public final String createDate;
	public final Map<String, String> metadata;
	
	public CreateMeetingMessage(String id, String externalId, String name, Boolean record, 
						String voiceBridge, Long duration, 
						Boolean autoStartRecording, Boolean allowStartStopRecording,
						Boolean webcamsOnlyForModerator, String moderatorPass,
						String viewerPass, Long createTime, String createDate, Map<String, String> metadata) {
		this.id = id;
		this.externalId = externalId;
		this.name = name;
		this.record = record;
		this.voiceBridge = voiceBridge;
		this.duration = duration;
		this.autoStartRecording = autoStartRecording;
		this.allowStartStopRecording = allowStartStopRecording;
		this.webcamsOnlyForModerator = webcamsOnlyForModerator;
		this.moderatorPass = moderatorPass;
		this.viewerPass = viewerPass;
		this.createTime = createTime;
		this.createDate = createDate;
		this.metadata = metadata;
	}
}
