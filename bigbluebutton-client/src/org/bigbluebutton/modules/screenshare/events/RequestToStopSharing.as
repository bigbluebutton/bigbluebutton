package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class RequestToStopSharing extends Event
  {
    public static const REQUEST_SHARE_STOP:String = "screenshare request to stop sharing event";
    
    public function RequestToStopSharing()
    {
      super(REQUEST_SHARE_STOP, true, false);
    }
  }
}