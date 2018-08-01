package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class RequestToStartSharing extends Event
  {
    
    public static const REQUEST_SHARE_START:String = "screenshare request to start sharing event";
    
    public var useWebRTC:Boolean = false;
    
    public function RequestToStartSharing(useWebRTC:Boolean)
    {
      super(REQUEST_SHARE_START, true, false);
      
      this.useWebRTC = useWebRTC;
    }
  }
}