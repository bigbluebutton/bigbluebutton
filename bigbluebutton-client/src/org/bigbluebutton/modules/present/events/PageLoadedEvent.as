package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class PageLoadedEvent extends Event
  {
    public static const PAGE_LOADED_EVENT:String = "presentation page loaded event";
    
    public var pageId: String;
    
    public function PageLoadedEvent(pageId: String)
    {
      super(PAGE_LOADED_EVENT, true, false);
      this.pageId = pageId;
    }
  }
}