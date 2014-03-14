package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcCallConnectedEvent extends Event
  {
    public static const WEBRTC_CALL_CONNECTED:String = "webrtc call connected event";
    
    public function WebRtcCallConnectedEvent() {
      super(WEBRTC_CALL_CONNECTED, true, false);
    }
  }
}