package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;
  
  public class LayoutChangedEvent extends Event
  {
    public static const LAYOUT_CHANGED:String = "layout changed event";
    
    public var layoutName:String;
    
    public function LayoutChangedEvent(layoutName:String)
    {
      super(LAYOUT_CHANGED, true, false);
      this.layoutName = layoutName;
    }
  }
}