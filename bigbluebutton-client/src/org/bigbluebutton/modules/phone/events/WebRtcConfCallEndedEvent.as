package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcConfCallEndedEvent extends Event
  {
    public static const WEBRTC_CONF_CALL_ENDED:String = "webrtc conf call ended event";
    
    public function WebRtcConfCallEndedEvent()
    {
      super(WEBRTC_CONF_CALL_ENDED, true, false);
    }
  }
}