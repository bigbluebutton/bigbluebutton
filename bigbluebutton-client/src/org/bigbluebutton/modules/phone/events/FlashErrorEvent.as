package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashErrorEvent extends Event
  {
    public static const FLASH_ERROR:String = "flash error event";
    
    public static const INVALID_ECHO_TEST_DESTINATION:String = "invalid echo test destination";
    public static const INVALID_VOICE_DESTINATION:String = "invalid voice conference destination";
    
    public var reason:String;
    
    public function FlashErrorEvent(reason:String)
    {
      super(FLASH_ERROR, true, false);
      this.reason = reason;
    }
  }
}