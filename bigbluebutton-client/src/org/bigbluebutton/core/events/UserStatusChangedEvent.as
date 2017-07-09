package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class UserStatusChangedEvent extends Event
  {
    public static const USER_STATUS_CHANGED: String = "user status changed event";
    
    public var userId: String;
    
    public function UserStatusChangedEvent(userId: String)
    {
      super(USER_STATUS_CHANGED, false, false);
      this.userId = userId;
    }
  }
}