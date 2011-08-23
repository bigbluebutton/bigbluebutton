package org.bigbluebutton.api.messaging;

public class MessagingConstants {
	//BigBlueButton Pattern
	public static final String BIGBLUEBUTTON_PATTERN = "bigbluebutton:meeting:*";
	
	//Messaging channels for each module
	public static final String SYSTEM_CHANNEL = "bigbluebutton:meeting:system";
	public static final String PARTICIPANTS_CHANNEL = "bigbluebutton:meeting:participants";
	public static final String PRESENTATION_CHANNEL = "bigbluebutton:meeting:presentation";
	
	
	public static final String END_MEETING_REQUEST_EVENT = "EndMeetingRequestEvent";
	public static final String MEETING_STARTED_EVENT = "MeetingStartedEvent";
	public static final String MEETING_ENDED_EVENT = "MeetingEndedEvent";
	public static final String USER_JOINED_EVENT = "UserJoinedEvent";
	public static final String USER_LEFT_EVENT = "UserLeftEvent";
	public static final String USER_STATUS_CHANGE_EVENT = "UserStatusChangeEvent";
}
