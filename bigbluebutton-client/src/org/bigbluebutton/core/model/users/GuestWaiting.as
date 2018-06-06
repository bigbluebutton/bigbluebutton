package org.bigbluebutton.core.model.users
{
  
  public class GuestWaiting {
    
    public static const WAIT:String = "WAIT";
    public static const ALLOW:String = "ALLOW";
    public static const DENY:String = "DENY";
    
    public var intId: String;
    public var name: String;
    public var role: String;
    public var guest: Boolean;
    public var authenticated: Boolean;
    
    public function GuestWaiting(intId: String, name: String, role: String, 
                                 guest: Boolean, authenticated: Boolean) {
      this.intId = intId;
      this.name = name;
      this.role = role;
      this.guest = guest;
      this.authenticated = authenticated;
    }
  }
}