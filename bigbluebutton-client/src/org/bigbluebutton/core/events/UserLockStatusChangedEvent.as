package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class UserLockStatusChangedEvent extends Event
  {
    public static const USER_LOCK_STATUS_CHANGED: String = "user lock status changed event";
    
    public var userId: String;
    public var locked: Boolean;
    
    public function UserLockStatusChangedEvent(userId: String, locked: Boolean)
    {
      super(USER_LOCK_STATUS_CHANGED, false, false);
      this.userId = userId;
      this.locked = locked;
    }
  }
}