package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcEchoTestStartedEvent extends Event
  {
    public static const WEBRTC_ECHO_TEST_STARTED:String = "webrtc echo test started event";
    
    public function WebRtcEchoTestStartedEvent()
    {
      super(WEBRTC_ECHO_TEST_STARTED, true, false);
    }
  }
}