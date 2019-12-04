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

package org.bigbluebutton.red5.pubsub;

public class MessagingConstants {

  public static final String FROM_BBB_APPS_CHANNEL = "bigbluebutton:from-bbb-apps";
  public static final String FROM_BBB_APPS_PATTERN = FROM_BBB_APPS_CHANNEL + ":*";
  public static final String FROM_SYSTEM_CHANNEL = FROM_BBB_APPS_CHANNEL + ":system";
  public static final String FROM_MEETING_CHANNEL = FROM_BBB_APPS_CHANNEL + ":meeting";
  public static final String FROM_PRESENTATION_CHANNEL = FROM_BBB_APPS_CHANNEL + ":presentation";
  public static final String FROM_POLLING_CHANNEL = FROM_BBB_APPS_CHANNEL + ":polling";
  public static final String FROM_USERS_CHANNEL = FROM_BBB_APPS_CHANNEL + ":users";
  public static final String FROM_WHITEBOARD_CHANNEL = FROM_BBB_APPS_CHANNEL + ":whiteboard";
  public static final String FROM_DESK_SHARE_CHANNEL = FROM_BBB_APPS_CHANNEL + ":deskshare";

  public static final String TO_BBB_APPS_CHANNEL = "bigbluebutton:to-bbb-apps";
  public static final String TO_BBB_APPS_PATTERN = TO_BBB_APPS_CHANNEL + ":*";
  public static final String TO_MEETING_CHANNEL = TO_BBB_APPS_CHANNEL + ":meeting";
  public static final String TO_SYSTEM_CHANNEL = TO_BBB_APPS_CHANNEL + ":system";
  public static final String TO_PRESENTATION_CHANNEL = TO_BBB_APPS_CHANNEL + ":presentation";
  public static final String TO_POLLING_CHANNEL = TO_BBB_APPS_CHANNEL + ":polling";
  public static final String TO_USERS_CHANNEL = TO_BBB_APPS_CHANNEL + ":users";
  public static final String TO_VOICE_CHANNEL = TO_BBB_APPS_CHANNEL + ":voice";
  public static final String TO_WHITEBOARD_CHANNEL = TO_BBB_APPS_CHANNEL + ":whiteboard";

  public static final String BBB_APPS_KEEP_ALIVE_CHANNEL = "bigbluebutton:from-bbb-apps:keepalive";

  public static final String TO_BBB_HTML5_CHANNEL = "bigbluebutton:to-bbb-html5";

  public static final String TO_VOICE_CONF_CHANNEL = "bigbluebutton:to-voice-conf";
  public static final String TO_VOICE_CONF_PATTERN = TO_VOICE_CONF_CHANNEL + ":*";
  public static final String TO_VOICE_CONF_SYSTEM_CHAN = TO_VOICE_CONF_CHANNEL + ":system";
  public static final String FROM_VOICE_CONF_CHANNEL = "bigbluebutton:from-voice-conf";
  public static final String FROM_VOICE_CONF_PATTERN = FROM_VOICE_CONF_CHANNEL + ":*";
  public static final String FROM_VOICE_CONF_SYSTEM_CHAN = FROM_VOICE_CONF_CHANNEL + ":system";

  public static final String FROM_BBB_RECORDING_CHANNEL  = "bigbluebutton:from-rap";

  public static final String TO_BBB_TRANSCODE_CHANNEL = "bigbluebutton:to-bbb-transcode";
  public static final String TO_BBB_TRANSCODE_PATTERN = TO_BBB_TRANSCODE_CHANNEL + ":*";
  public static final String TO_BBB_TRANSCODE_SYSTEM_CHAN = TO_BBB_TRANSCODE_CHANNEL + ":system";
  public static final String FROM_BBB_TRANSCODE_CHANNEL = "bigbluebutton:from-bbb-transcode";
  public static final String FROM_BBB_TRANSCODE_PATTERN = FROM_BBB_TRANSCODE_CHANNEL + ":*";
  public static final String FROM_BBB_TRANSCODE_SYSTEM_CHAN = FROM_BBB_TRANSCODE_CHANNEL + ":system";


  public static final String DESTROY_MEETING_REQUEST_EVENT = "DestroyMeetingRequestEvent";
  public static final String CREATE_MEETING_REQUEST_EVENT = "CreateMeetingRequestEvent";
  public static final String END_MEETING_REQUEST_EVENT = "EndMeetingRequestEvent";
  public static final String MEETING_STARTED_EVENT = "meeting_created_message";
  public static final String MEETING_ENDED_EVENT = "meeting_ended_event";
  public static final String MEETING_DESTROYED_EVENT = "meeting_destroyed_event";
  public static final String USER_JOINED_EVENT = "UserJoinedEvent";
  public static final String USER_LEFT_EVENT = "UserLeftEvent";
  public static final String USER_LEFT_VOICE_REQUEST = "user_left_voice_request";
  public static final String USER_STATUS_CHANGE_EVENT = "UserStatusChangeEvent";
  public static final String USER_ROLE_CHANGE_EVENT = "UserRoleChangeEvent";
  public static final String SEND_POLLS_EVENT = "SendPollsEvent";
  public static final String RECORD_STATUS_EVENT = "RecordStatusEvent";
  public static final String SEND_PUBLIC_CHAT_MESSAGE_REQUEST = "send_public_chat_message_request";
  public static final String SEND_PRIVATE_CHAT_MESSAGE_REQUEST = "send_private_chat_message_request";
  public static final String MUTE_USER_REQUEST = "mute_user_request";
}
