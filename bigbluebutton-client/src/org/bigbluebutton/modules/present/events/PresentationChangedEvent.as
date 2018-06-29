package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class PresentationChangedEvent extends Event
  {
    public static const PRESENTATION_CHANGED_EVENT: String = "presentation changed event";
    
    public var podId: String;
    public var presentationId: String;
    
    public function PresentationChangedEvent(_podId: String, _presid: String)
    {
      super(PRESENTATION_CHANGED_EVENT, true, false);
      podId = _podId;  
      presentationId = _presid;
    }
  }
}
