package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcCallEndedEvent extends Event
  {
    public static const WEBRTC_CALL_ENDED:String = "webrtc call ended event";
    
    public var cause:String;
    
    public function WebRtcCallEndedEvent(cause:String)
    {
      super(WEBRTC_CALL_ENDED, true, false);
      this.cause = cause;
    }
  }
}