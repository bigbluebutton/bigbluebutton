package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashEchoTestHasAudioEvent extends Event
  {
    public static const FLASH_ECHO_TEST_HAS_AUDIO:String = "flash echo test has audio event";
    
    public function FlashEchoTestHasAudioEvent()
    {
      super(FLASH_ECHO_TEST_HAS_AUDIO, true, false);
    }
  }
}