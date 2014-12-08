package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class ConversionPageCountError extends Event
  {
    public static const PAGE_COUNT_ERROR:String = "presentation conversion page count error event";
    
    public function ConversionPageCountError()
    {
      super(PAGE_COUNT_ERROR, true, false);
    }
  }
}