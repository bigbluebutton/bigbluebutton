package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashMicSettingsEvent extends Event
  {
    public static const FLASH_MIC_SETTINGS:String = "perform flash echo test event";
    
    public var micNames:Array = new Array();
    
    public function FlashMicSettingsEvent(mics:Array)
    {
      super(FLASH_MIC_SETTINGS, true, false);
      micNames = mics;
    }
  }
}