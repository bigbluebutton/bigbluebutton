package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class ConversionPageCountMaxed extends Event
  {
    public static const PAGE_COUNT_MAXED:String = "presentation page count maxed event";
    
    public var maxPages:Number;
    
    public function ConversionPageCountMaxed(max:Number)
    {
      super(PAGE_COUNT_MAXED, true, false);
      maxPages = max;
    }
  }
}