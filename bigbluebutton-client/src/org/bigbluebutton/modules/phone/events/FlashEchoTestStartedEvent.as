package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashEchoTestStartedEvent extends Event
  {
    public static const ECHO_TEST_STARTED:String = "flash echo test started event";
    
    public function FlashEchoTestStartedEvent()
    {
      super(ECHO_TEST_STARTED, true, false);
    }
  }
}