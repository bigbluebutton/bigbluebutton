package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  
  public class SyncLayoutEvent extends Event
  {    
    public static const SYNC_LAYOUT_EVENT:String = 'sync others with layout event';
    public var layout:LayoutDefinition;
    
    public function SyncLayoutEvent(layout: LayoutDefinition)
    {
      super(SYNC_LAYOUT_EVENT, true, false);
      this.layout = layout;
    }
  }
}