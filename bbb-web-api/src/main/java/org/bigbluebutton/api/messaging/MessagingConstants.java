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
	
	public static final String FROM_BBB_APPS_CHANNEL       = "bigbluebutton:from-bbb-apps";
	public static final String FROM_BBB_APPS_PATTERN       = FROM_BBB_APPS_CHANNEL + ":*";
	public static final String FROM_SYSTEM_CHANNEL         = FROM_BBB_APPS_CHANNEL + ":system";
	public static final String FROM_MEETING_CHANNEL        = FROM_BBB_APPS_CHANNEL + ":meeting";
  public static final String FROM_PRESENTATION_CHANNEL   = FROM_BBB_APPS_CHANNEL + ":presentation";
  public static final String FROM_POLLING_CHANNEL        = FROM_BBB_APPS_CHANNEL + ":polling";
  public static final String FROM_USERS_CHANNEL          = FROM_BBB_APPS_CHANNEL + ":users";
  public static final String FROM_CHAT_CHANNEL           = FROM_BBB_APPS_CHANNEL + ":chat"; 
  
  
	public static final String TO_BBB_APPS_CHANNEL         = "bigbluebutton:to-bbb-apps";	
	public static final String TO_BBB_APPS_PATTERN         = TO_BBB_APPS_CHANNEL + ":*";
	public static final String TO_MEETING_CHANNEL          = TO_BBB_APPS_CHANNEL + ":meeting";	
	public static final String TO_SYSTEM_CHANNEL           = TO_BBB_APPS_CHANNEL + ":system";
  public static final String TO_PRESENTATION_CHANNEL     = TO_BBB_APPS_CHANNEL + ":presentation";
  public static final String TO_POLLING_CHANNEL          = TO_BBB_APPS_CHANNEL + ":polling";
  public static final String TO_USERS_CHANNEL            = TO_BBB_APPS_CHANNEL + ":users";
  public static final String TO_CHAT_CHANNEL             = TO_BBB_APPS_CHANNEL + ":chat";   

	
	public static final String MEETING_STARTED_EVENT         = "meeting_created_message";
	public static final String MEETING_ENDED_EVENT           = "meeting_ended_message";
	public static final String MEETING_DESTROYED_EVENT       = "meeting_destroyed_event";
	public static final String USER_JOINED_EVENT             = "user_joined_message";
	public static final String USER_LEFT_EVENT               = "user_left_message";
	public static final String USER_STATUS_CHANGE_EVENT      = "user_status_changed_message";
	public static final String USER_JOINED_VOICE_EVENT       = "user_joined_voice_message";
	public static final String USER_LEFT_VOICE_EVENT         = "user_left_voice_message";
	public static final String USER_LISTEN_ONLY_EVENT        = "user_listening_only";
	public static final String USER_SHARE_WEBCAM_EVENT       = "user_shared_webcam_message";
	public static final String USER_UNSHARE_WEBCAM_EVENT     = "user_unshared_webcam_message";
			
	public static final String SEND_POLLS_EVENT = "SendPollsEvent";
	public static final String KEEP_ALIVE_REPLY = "keep_alive_reply";
	
	public static final String BBB_APPS_KEEP_ALIVE_CHANNEL = "bigbluebutton:from-bbb-apps:keepalive";
}
