package org.bigbluebutton.main.events
{
  import flash.events.Event;
  
  public class InvalidAuthTokenEvent extends Event
  {
    public static const INVALID_AUTH_TOKEN:String = "invalid_auth_token_event";
    
    public function InvalidAuthTokenEvent()
    {
      super(INVALID_AUTH_TOKEN, true, false);
    }
  }
}