package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class PageChangedEvent extends Event
  {
    public static const PRESENTATION_PAGE_CHANGED_EVENT:String = "presentation page changed event";
    
    public var podId: String;
    public var pageId: String;
    
    public function PageChangedEvent(podId: String, pageId: String)
    {
      super(PRESENTATION_PAGE_CHANGED_EVENT, true, false);
      this.pageId = pageId;
      this.podId = podId;
    }
  }
}
