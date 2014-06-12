package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcEchoTestFailedEvent extends Event
  {
    public static const WEBRTC_ECHO_TEST_FAILED:String = "webrtc echo test failed event";
    public var reason:String;
    
    public function WebRtcEchoTestFailedEvent(reason:String)
    {
      super(WEBRTC_ECHO_TEST_FAILED, true, false);
      this.reason = reason;
    }
  }
}