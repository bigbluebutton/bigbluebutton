package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class PageMovedEvent extends Event
  {
    public static const PAGE_MOVED_EVENT: String = "presentation page moved event";
    
    public var id: String;
    public var xOffset: Number;
    public var yOffset: Number;
    public var widthRatio: Number;
    public var heightRatio: Number;
    
    public function PageMovedEvent(id: String, xOffset: Number, yOffset: Number, widthRatio: Number, heightRatio: Number)
    {
      super(PAGE_MOVED_EVENT, true, false);
      this.id = id;
      this.xOffset = xOffset;
      this.yOffset = yOffset;
      this.widthRatio = widthRatio;
      this.heightRatio = heightRatio;      
    }
  }
}