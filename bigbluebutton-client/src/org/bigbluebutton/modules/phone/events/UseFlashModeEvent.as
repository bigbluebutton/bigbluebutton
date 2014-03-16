package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class UseFlashModeEvent extends Event
  {
    public static const USE_FLASH_MODE:String = "use flash to join voice event";
    
    public function UseFlashModeEvent()
    {
      super(USE_FLASH_MODE, true, false);
    }
  }
}