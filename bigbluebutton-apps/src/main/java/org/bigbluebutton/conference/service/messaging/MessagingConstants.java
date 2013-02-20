package org.bigbluebutton.conference.service.messaging;

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
	public static final String GUEST_ASK_TO_ENTER_EVENT = "guestAskToEnter";
	public static final String MODERATOR_RESPONSE_EVENT = "responseToGuest";
	public static final String GUESTS_WAITING_EVENT = "guestsWaitingEvent";
	public static final String NEW_GUEST_POLICY = "newGuestPolicy";
}
