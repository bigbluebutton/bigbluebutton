package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcConfCallStartedEvent extends Event
  {    
    public static const WEBRTC_CONF_CALL_STARTED:String = "webrtc conference call started event";
    
    public function WebRtcConfCallStartedEvent()
    {
      super(WEBRTC_CONF_CALL_STARTED, true, false);
    }
  }
}