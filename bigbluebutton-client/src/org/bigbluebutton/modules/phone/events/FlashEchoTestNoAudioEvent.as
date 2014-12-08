package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashEchoTestNoAudioEvent extends Event
  {
    public static const FLASH_ECHO_TEST_NO_AUDIO:String = "flash echo test no audio event";
    
    public function FlashEchoTestNoAudioEvent()
    {
      super(FLASH_ECHO_TEST_NO_AUDIO, true, false);
    }
  }
}