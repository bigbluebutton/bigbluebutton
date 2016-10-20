package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class StartShareRequestFailedEvent extends Event
  {
    public static const REQUEST_SHARE_FAILED:String = "screenshare request to start share failed event";
    
    public function StartShareRequestFailedEvent()
    {
      super(REQUEST_SHARE_FAILED, true, false);
    }
  }
}