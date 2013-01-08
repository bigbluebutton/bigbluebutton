package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class SwitchedLayoutEvent extends Event
  {
    public static const SWITCHED_LAYOUT_EVENT:String = "switched layout event";
    
    public var layoutID:String;
    
    public function SwitchedLayoutEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(SWITCHED_LAYOUT_EVENT, bubbles, cancelable);
    }
  }
}