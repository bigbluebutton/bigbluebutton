package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class PollUpdateWindowEvent extends Event
  {
    public static const CLOSE_WINDOW:String = "close poll update window event";
    
    public function PollUpdateWindowEvent(type:String)
    {
      super(type, true, false);
    }    
  }
}