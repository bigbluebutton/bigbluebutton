package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcEchoTestHasAudioEvent extends Event
  {
    public static const WEBRTC_ECHO_TEST_HAS_AUDIO:String = "webrtc echo test has audio event";
    
    public function WebRtcEchoTestHasAudioEvent()
    {
      super(WEBRTC_ECHO_TEST_HAS_AUDIO, true, false);
    }
  }
}