package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashMicUnavailableEvent extends Event
  {
    public static const MIC_UNAVAILABLE:String = "flash mic unavailable event";
    
    public function FlashMicUnavailableEvent()
    {
      super(MIC_UNAVAILABLE, true, false);
    }
  }
}