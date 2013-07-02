package org.bigbluebutton.modules.polling.model
{
  public class Responder
  {
    private var _userID:String;
    private var _username:String;
    
    public function Responder(userID:String, username:String)
    {
      _userID = userID;
      _username = username;
    }
    
    public function get userID():String {
      return _userID;
    }
    
    public function get username():String {
      return _username;
    }
  }
}