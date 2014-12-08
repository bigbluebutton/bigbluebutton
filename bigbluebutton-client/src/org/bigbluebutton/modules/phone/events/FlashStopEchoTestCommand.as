package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashStopEchoTestCommand extends Event
  {
    
    public static const FLASH_STOP_ECHO_TEST:String = "stop flash echo test command";
    
    public function FlashStopEchoTestCommand()
    {
      super(FLASH_STOP_ECHO_TEST, true, false);
    }
  }
}