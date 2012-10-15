package org.bigbluebutton.core
{
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.model.users.BBBUser;

  public class UsersUtil
  {
    public static function getMyUserID():String {
      return UserManager.getInstance().getConference().getMyUserId();
    }
    
    public static function getMyUsername():String {
      return UserManager.getInstance().getConference().getMyName();
    }
    
    public static function internalUserIDToExternalUserID(userID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUser(userID);
      if (user != null) {
        return user.externUserID;
      }
      return null;
    }
    
    public static function externalUserIDToInternalUserID(externUserID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUserWithExternUserID(externUserID);
      if (user != null) {
        return user.userID;
      }
      return null;
    }    
  }
}