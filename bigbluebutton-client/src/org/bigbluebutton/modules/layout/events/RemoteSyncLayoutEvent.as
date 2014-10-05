package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;
  
  public class RemoteSyncLayoutEvent extends Event
  {
    public static const REMOTE_SYNC_LAYOUT_EVENT:String = "remote sync layout event";
    
    public var layout:String;
    
    public function RemoteSyncLayoutEvent(layout:String)
    {
      super(REMOTE_SYNC_LAYOUT_EVENT, true, false);
      this.layout = layout;
    }
  }
}