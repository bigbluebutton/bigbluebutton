package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class GetMyUserInfoRequestEvent extends Event
  {
    public static const GET_MY_USER_INFO_REQUEST:String = "get my user info request event";
    
    public function GetMyUserInfoRequestEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(GET_MY_USER_INFO_REQUEST, bubbles, cancelable);
    }
  }
}