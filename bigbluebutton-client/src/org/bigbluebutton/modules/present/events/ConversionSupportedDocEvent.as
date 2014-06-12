package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class ConversionSupportedDocEvent extends Event
  {
    
    public static const SUPPORTED_DOC:String = "presentation supported document event";
    
    public function ConversionSupportedDocEvent()
    {
      super(SUPPORTED_DOC, true, false);
    }
  }
}