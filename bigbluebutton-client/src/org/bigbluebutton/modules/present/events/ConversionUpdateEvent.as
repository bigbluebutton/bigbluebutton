package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class ConversionUpdateEvent extends Event
  {
    public static const CONVERSION_UPDATE:String = "presentation conversion update event";
      
    public var totalPages:Number;
    public var numPagesDone:Number;
    
    public function ConversionUpdateEvent(total:Number, numPages:Number)
    {
      super(CONVERSION_UPDATE, true, false);
      totalPages = total;
      numPagesDone = numPages;
    }
  }
}