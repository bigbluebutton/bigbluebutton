package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashStartEchoTestCommand extends Event
  {
    
    public static const START_FLASH_ECHO_TEST:String = "start flash echo test command";
    
    public var micIndex:int = -1;
    public var micName:String = "";
    
    public function FlashStartEchoTestCommand(index:int, name:String)
    {
      super(START_FLASH_ECHO_TEST, true, false);
      micIndex = index;
      micName = name;
    }
  }
}