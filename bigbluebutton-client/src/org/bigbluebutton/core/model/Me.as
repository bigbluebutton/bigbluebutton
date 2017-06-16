package org.bigbluebutton.core.model
{
  public class Me
  {
    public var id:String = "";
    public var name:String = "";
    public var externalId:String = "";
    public var authToken:String = "";
    public var layout:String = "";
    public var logoutURL:String = "";
    
    public var welcome:String = "";
    public var avatarURL:String = "";
    public var dialNumber:String = "";
    
    public var guest:Boolean = true;
    public var authed:Boolean = false;
    public var customData:Object = new Object();
    
    private var _role:String =  "viewer";
    
    
    public function get role():String {
      return _role.toUpperCase();
    }
    
    public function set role(value: String):void {
      _role = role;
    }
  }
}