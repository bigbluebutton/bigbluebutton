package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class StartShareRequestSuccessEvent extends Event
  {
    public static const START_SHARE_REQUEST_SUCCESS:String = "screenshare start share request success event";
    
    public var authToken: String;
    
    public function StartShareRequestSuccessEvent(token: String)
    {
      super(START_SHARE_REQUEST_SUCCESS, true, false);
      authToken = token;
    }
  }
}