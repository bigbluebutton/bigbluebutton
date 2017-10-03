package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class ConversionCompletedEvent extends Event
  {
    public static const CONVERSION_COMPLETED:String = "presentation conversion completed event";
    
    public var presId:String;
    public var presName:String;
    public var podId:String;
    
    public function ConversionCompletedEvent(destPodId: String, presentationId:String, presentationName:String)
    {
      super(CONVERSION_COMPLETED, true, false);
      podId = destPodId;
      presId = presentationId;
      presName = presentationName;
    }
  }
}
