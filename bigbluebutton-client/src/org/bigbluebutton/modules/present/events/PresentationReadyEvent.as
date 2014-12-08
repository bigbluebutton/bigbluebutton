package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class PresentationReadyEvent extends Event
  {
    public static const READY_EVENT:String = "presentation ready event";
    
    public var presId: String;
    
    public function PresentationReadyEvent(presId: String)
    {
      super(READY_EVENT, true, false);
      this.presId = presId;
    }
  }
}