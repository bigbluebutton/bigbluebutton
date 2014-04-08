package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcCallDisconnectedEvent extends Event
  {
    public static const WEBRTC_CALL_DISCONNECTED:String = "webrtc call disconnected event";
    
    public function WebRtcCallDisconnectedEvent() {
      super(WEBRTC_CALL_DISCONNECTED, true, false);
    }
  }
}