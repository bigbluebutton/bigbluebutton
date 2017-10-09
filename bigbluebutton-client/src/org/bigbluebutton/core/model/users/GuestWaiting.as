package org.bigbluebutton.core.model.users
{
  
  public class GuestWaiting {
    
    public static const WAIT:String = "WAIT";
    public static const ALLOW:String = "ALLOW";
    public static const DENY:String = "DENY";
    
    public var intId: String;
    public var name: String;
    public var role: String;
    
    public function GuestWaiting(intId: String, name: String, role: String) {
      this.intId = intId;
      this.name = name;
      this.role = role;
    }
  }
}