package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcEchoTestNoAudioEvent extends Event
  {
    public static const WEBRTC_ECHO_TEST_NO_AUDIO:String = "webrtc echo test no audio event";
    
    public function WebRtcEchoTestNoAudioEvent()
    {
      super(WEBRTC_ECHO_TEST_NO_AUDIO, true, false);
    }
  }
}