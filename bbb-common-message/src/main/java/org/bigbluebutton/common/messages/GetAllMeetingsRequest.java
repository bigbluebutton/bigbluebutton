package org.bigbluebutton.common.messages;

public class GetAllMeetingsRequest implements IBigBlueButtonMessage {
	public static final String GET_ALL_MEETINGS_REQUEST_EVENT  = "get_all_meetings_request";
	public static final String VERSION = "0.0.1";

	public final String meetingId;

	public GetAllMeetingsRequest(String meetingId) {
		this.meetingId = meetingId;
	}
}