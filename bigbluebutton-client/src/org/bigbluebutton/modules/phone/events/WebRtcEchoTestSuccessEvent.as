package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcEchoTestSuccessEvent extends Event
  {
    public static const WEBRTC_ECHO_TEST_SUCCESS:String = "webrtc echo test success event";
    
    public function WebRtcEchoTestSuccessEvent()
    {
      super(WEBRTC_ECHO_TEST_SUCCESS, true, false);
    }
  }
}