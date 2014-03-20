package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashStartEchoTestCommand extends Event
  {
    
    public static const STOP_FLASH_ECHO_TEST:String = "stop flash echo test command";
    
    public var micIndex:int = -1;
    public var micName:String = "";
    
    public function FlashStartEchoTestCommand(index:int, name:String)
    {
      super(STOP_FLASH_ECHO_TEST, true, false);
      micIndex = index;
      micName = name;
    }
  }
}