package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashMicAccessAllowedEvent extends Event
  {
    public static const MIC_ACCESS_ALLOWED:String = "flash mic access permission allowe event";
    
    public var micName:String;
    
    public function FlashMicAccessAllowedEvent(micName:String)
    {
      super(MIC_ACCESS_ALLOWED, true, false);
      this.micName = micName;
    }
  }
}