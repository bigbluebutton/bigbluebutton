package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashCallStartedEvent extends Event
  {
    public static const FLASH_CALL_STARTED:String = "flash call started event";
    
    public function FlashCallStartedEvent()
    {
      super(FLASH_CALL_STARTED, true, false);
    }
  }
}