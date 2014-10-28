package org.bigbluebutton.core.connection.events
{
  import flash.events.Event;
  
  public class UserJoinedEvent extends Event
  {
    public static const USER_JOINED_EVENT: String = "user_joined_event";
    
    public function UserJoinedEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
    {
      super(USER_JOINED_EVENT, bubbles, cancelable);
    }
  }
}