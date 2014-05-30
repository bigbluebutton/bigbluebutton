package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;
  
  public class LayoutLockedEvent extends Event
  {
    public static const LAYOUT_LOCKED:String = "layout locked event";
    
    public var locked:Boolean;
    public var setById:String;
    
    public function LayoutLockedEvent(locked:Boolean, setById: String)
    {
      super(LAYOUT_LOCKED, true, false);
      this.locked = locked;
      this.setById = setById;
    }
  }
}