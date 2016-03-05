/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.app.screenshare.messaging.redis;

public class MessagingConstants {
	
	public static final String FROM_BBB_APPS_CHANNEL = "bigbluebutton:from-bbb-apps";
	public static final String FROM_BBB_APPS_PATTERN = FROM_BBB_APPS_CHANNEL + ":*";
	public static final String FROM_SYSTEM_CHANNEL = FROM_BBB_APPS_CHANNEL + ":system";
	public static final String FROM_MEETING_CHANNEL = FROM_BBB_APPS_CHANNEL + ":meeting";

	public static final String TO_BBB_APPS_CHANNEL = "bigbluebutton:to-bbb-apps";	
	public static final String TO_BBB_APPS_PATTERN = TO_BBB_APPS_CHANNEL + ":*";
	public static final String TO_MEETING_CHANNEL = TO_BBB_APPS_CHANNEL + ":meeting";	
	public static final String TO_SYSTEM_CHANNEL = TO_BBB_APPS_CHANNEL + ":system";

	public static final String DESTROY_MEETING_REQUEST_EVENT = "DestroyMeetingRequestEvent";
	public static final String CREATE_MEETING_REQUEST_EVENT = "CreateMeetingRequestEvent";	
	public static final String END_MEETING_REQUEST_EVENT = "EndMeetingRequestEvent";
	public static final String MEETING_STARTED_EVENT = "meeting_created_message";
	public static final String MEETING_ENDED_EVENT = "meeting_ended_event";
	public static final String MEETING_DESTROYED_EVENT = "meeting_destroyed_event";

}
