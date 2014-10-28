/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.api.messaging;

public class MessagingConstants {
	//BigBlueButton Pattern
	public static final String BIGBLUEBUTTON_PATTERN = "bigbluebutton:meeting:*";
	
	//Messaging channels for each module
	public static final String SYSTEM_CHANNEL = "bigbluebutton:meeting:system";
	public static final String PARTICIPANTS_CHANNEL = "bigbluebutton:meeting:participants";
	public static final String PRESENTATION_CHANNEL = "bigbluebutton:meeting:presentation";
	public static final String POLLING_CHANNEL = "bigbluebutton:meeting:polling";
	
	public static final String DESTROY_MEETING_REQUEST_EVENT = "DestroyMeetingRequestEvent";
	public static final String CREATE_MEETING_REQUEST_EVENT = "CreateMeetingRequestEvent";
	public static final String END_MEETING_REQUEST_EVENT = "EndMeetingRequestEvent";
	public static final String MEETING_STARTED_EVENT = "MeetingStartedEvent";
	public static final String MEETING_ENDED_EVENT = "MeetingEndedEvent";
	public static final String USER_JOINED_EVENT = "UserJoinedEvent";
	public static final String USER_LEFT_EVENT = "UserLeftEvent";
	public static final String USER_STATUS_CHANGE_EVENT = "UserStatusChangeEvent";

	public static final String SEND_POLLS_EVENT = "SendPollsEvent";
	public static final String KEEP_ALIVE_REPLY_EVENT = "KEEP_ALIVE_REPLY";
}
