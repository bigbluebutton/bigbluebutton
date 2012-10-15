package org.bigbluebutton.core
{
  import org.bigbluebutton.core.managers.UserManager;

  public class UsersUtil
  {
    public static function getMyUserID():String {
      return UserManager.getInstance().getConference().getMyUserId();
    }
    
    public static function getMyUsername():String {
      return UserManager.getInstance().getConference().getMyName();
    }
    
    public static function internalUserIDToExternalUserID(userID:String):String {
      return "";
    }
  }
}