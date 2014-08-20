package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;
  
  public class ChangeLayoutEvent extends Event
  {
    public static const CHANGE_LAYOUT:String = "change layout event";
    
    public var layoutName:String;
    
    public function ChangeLayoutEvent(layoutName:String)
    {
      super(CHANGE_LAYOUT, true, false);
      this.layoutName = layoutName;
    }
  }
}