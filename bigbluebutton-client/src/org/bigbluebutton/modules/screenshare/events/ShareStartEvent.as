package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class ShareStartEvent extends Event
  {
    public static const SHARE_START:String = "screenshare share start event";
    
    
    public function ShareStartEvent()
    {
      super(SHARE_START, true, false);
    }
  }
}