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
    public static const SEND_PRIVATE_CHAT_REQ:String      = 'SendPrivateChatRequest';
    
    
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
    public static const SWITCHED_LAYOUT:String            = 'SwitchedLayoutEvent';
    public static const REMOTE_LOCKED_LAYOUT:String       = 'RemoteLockedLayoutEvent';
    public static const REMOTE_UNLOCKED_LAYOUT:String     = 'RemoteUnlockedLayoutEvent';
    public static const USER_JOINED_VOICE:String          = 'UserJoinedVoiceEvent';
    public static const USER_LEFT_VOICE:String            = 'UserLeftVoiceEvent';
    public static const USER_MUTED_VOICE:String           = 'UserVoiceMutedEvent';
    public static const USER_TALKING:String               = 'UserTalkingEvent';
    public static const USER_LOCKED_VOICE:String          = 'UserLockedVoiceEvent';
    public static const START_PRIVATE_CHAT:String         = "StartPrivateChatEvent";
    public static const GET_MY_USER_INFO_REP:String       = "GetMyUserInfoResponse";
    public static const IS_USER_PUBLISHING_CAM_RESP:String = "IsUserPublishingCamResponse";
    
  }
}