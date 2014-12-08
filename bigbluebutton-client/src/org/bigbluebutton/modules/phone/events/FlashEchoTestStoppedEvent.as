package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashEchoTestStoppedEvent extends Event
  {
    public static const ECHO_TEST_STOPPED:String = "flash echo test stopped event";
    
    public function FlashEchoTestStoppedEvent()
    {
      super(ECHO_TEST_STOPPED, true, false);
    }
  }
}