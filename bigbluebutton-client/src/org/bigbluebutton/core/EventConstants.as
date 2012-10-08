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
    
    
    /** Events to External JS **/
    public static const GET_MY_ROLE_RESP:String           = 'GetMyRoleResponse';
 
    public static const USER_JOINED:String          = 'UserJoinedEvent';
    public static const USER_LEFT:String            = 'UserLeftEvent';
    public static const NEW_ROLE:String             = 'NewRoleEvent';
  }
}