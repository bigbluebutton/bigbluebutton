package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class ConversionUnsupportedDocEvent extends Event
  {
    public static const UNSUPPORTED_DOC:String = "presentation conversion unsupported doc event";
    
    public function ConversionUnsupportedDocEvent()
    {
      super(UNSUPPORTED_DOC, true, false);
    }
  }
}