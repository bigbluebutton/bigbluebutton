package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  
  public class LockLayoutEvent extends Event
  {
    public static const LOCK_LAYOUT:String = "lock layout request event";
    
    public var lock:Boolean;
    public var viewersOnly:Boolean;
    public var layout:LayoutDefinition;
    
    public function LockLayoutEvent(lock:Boolean, viewersOnly: Boolean, layout: LayoutDefinition)
    {
      super(LOCK_LAYOUT, true, false);
      this.lock = lock;
      this.viewersOnly = viewersOnly;
      this.layout = layout;
    }
  }
}