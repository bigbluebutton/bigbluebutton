package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashEchoTestEvent extends Event
  {
    public static const FLASH_ECHO_TEST:String = "perform flash echo test event";
    
    public var micNames:Array = new Array();
    
    public function FlashEchoTestEvent(mics:Array)
    {
      super(FLASH_ECHO_TEST, true, false);
      micNames = mics;
    }
  }
}