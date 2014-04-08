package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcCallFailedEvent extends Event
  {
    public static const WEBRTC_CALL_FAILED:String = "webrtc call failed event";
    
    public var reason:String;
    
    public function WebRtcCallFailedEvent(reason: String)
    {
      super(WEBRTC_CALL_FAILED, true, false);
      this.reason = reason;
    }
  }
}