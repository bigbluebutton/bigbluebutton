package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashCallEndedEvent extends Event
  {
    public static const FLASH_CALL_ENDED:String = "flash call ended event";
    
    public function FlashCallEndedEvent()
    {
      super(FLASH_CALL_ENDED, true, false);
    }
  }
}