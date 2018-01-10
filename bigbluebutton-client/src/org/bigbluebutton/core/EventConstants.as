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
package org.bigbluebutton.core
{
  public class EventConstants
  {
    /** Requests from External JS **/
    
    public static const GET_MY_ROLE_REQ:String            = 'GetMyRoleRequest';
    public static const JOIN_VOICE_REQ:String             = 'JoinVoiceRequest';
    public static const SHARE_CAM_REQ:String              = 'ShareCameraRequest';
    public static const MUTE_ALL_REQ:String               = 'MuteAllRequest';
    public static const MUTE_USER_REQ:String              = 'MuteUserRequest';
    public static const LOGOUT_REQ:String                 = 'LogoutRequest';    
    public static const SWITCH_LAYOUT_REQ:String          = 'SwitchLayoutRequest';
    public static const LOCK_LAYOUT_REQ:String            = 'LockLayoutRequest';
    public static const UNLOCK_LAYOUT_REQ:String          = 'UnlockLayoutRequest';
    public static const SEND_PUBLIC_CHAT_REQ:String       = 'SendPublicChatRequest';
    
    /** Events to External JS **/
    public static const GET_MY_ROLE_RESP:String           = 'GetMyRoleResponse';
    public static const AM_I_PRESENTER_RESP:String        = 'AmIPresenterQueryResponse';
    public static const AM_I_SHARING_CAM_RESP:String      = 'AmISharingCamQueryResponse';
    public static const BROADCASTING_CAM_STARTED:String   = 'BroadcastingCameraStartedEvent';
    public static const BROADCASTING_CAM_STOPPED:String   = 'BroadcastingCameraStoppedEvent';
    public static const I_AM_SHARING_CAM:String           = 'IAmSharingCamEvent';
    public static const CAM_STREAM_SHARED:String          = 'CamStreamSharedEvent';
    public static const USER_JOINED:String                = 'UserJoinedEvent';
    public static const USER_LEFT:String                  = 'UserLeftEvent';
    public static const SWITCHED_PRESENTER:String         = 'SwitchedPresenterEvent';
    public static const NEW_ROLE:String                   = 'NewRoleEvent';
    public static const NEW_PRIVATE_CHAT:String           = 'NewPrivateChatEvent';
    public static const NEW_PUBLIC_CHAT:String            = 'NewPublicChatEvent';
	public static const NEW_GROUP_CHAT:String             = 'NewGroupChatEvent';
    public static const SWITCHED_LAYOUT:String            = 'SwitchedLayoutEvent';
    public static const USER_JOINED_VOICE:String          = 'UserJoinedVoiceEvent';
    public static const USER_LEFT_VOICE:String            = 'UserLeftVoiceEvent';
    public static const USER_KICKED_OUT:String            = 'UserKickedOutEvent';
    public static const USER_MUTED_VOICE:String           = 'UserVoiceMutedEvent';
    public static const USER_TALKING:String               = 'UserTalkingEvent';
    public static const USER_LOCKED:String          	  = 'UserLockedEvent';
    public static const START_PRIVATE_CHAT:String         = "StartPrivateChatEvent";
    public static const GET_MY_USER_INFO_REP:String       = "GetMyUserInfoResponse";
    public static const IS_USER_PUBLISHING_CAM_RESP:String = "IsUserPublishingCamResponse";
    public static const OPEN_EXTERNAL_UPLOAD_WINDOW:String = "OpenExternalFileUploadWindowEvent";
    public static const QUERY_PRESENTATION_REPLY:String    = "QueryPresentationsReplyEvent";
	public static const PRESENTATION_PODS_COUNT_UPDATE:String = "PresentationPodsCountUpdate";
    
    /** For Conversion Update Events **/
    public static const OFFICE_DOC_CONVERSION_SUCCESS:String    = "OfficeDocConversionSuccessEvent";
    public static const OFFICE_DOC_CONVERSION_FAILED:String     = "OfficeDocConversionFailedEvent";
	public static const OFFICE_DOC_CONVERSION_INVALID:String    = "OfficeDocConversionInvalidEvent";
    public static const SUPPORTED_DOCUMENT:String               = "SupportedDocEvent";
    public static const UNSUPPORTED_DOCUMENT:String             = "UnsupportedDocEvent";    
    public static const PAGE_COUNT_FAILED:String                = "PageCountFailedEvent";
    public static const THUMBNAILS_UPDATE:String                = "ThumbnailsUpdateEvent";
    public static const PAGE_COUNT_EXCEEDED:String              = "PageCountExceededEvent";
    public static const CONVERT_SUCCESS:String                  = "ConversionSuccessEvent";
    public static const CONVERT_UPDATE:String                   = "ConversionProgressEvent";

  }
}