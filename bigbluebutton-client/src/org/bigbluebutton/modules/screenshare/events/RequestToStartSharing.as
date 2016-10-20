package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class RequestToStartSharing extends Event
  {
    
    public static const REQUEST_SHARE_START:String = "screenshare request to start sharing event";
    
    public function RequestToStartSharing()
    {
      super(REQUEST_SHARE_START, true, false);
    }
  }
}