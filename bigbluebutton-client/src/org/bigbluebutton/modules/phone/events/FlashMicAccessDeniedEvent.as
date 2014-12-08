package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashMicAccessDeniedEvent extends Event
  {
    public static const MIC_ACCESS_DENIED:String = "flash mic access permission denied event";
    
    public var micName:String;
    
    public function FlashMicAccessDeniedEvent(micName:String)
    {
      super(MIC_ACCESS_DENIED, true, false);
      this.micName = micName;
    }
  }
}