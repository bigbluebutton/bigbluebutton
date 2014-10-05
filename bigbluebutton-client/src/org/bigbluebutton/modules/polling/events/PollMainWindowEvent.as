package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class PollMainWindowEvent extends Event
  {
    public static const OPEN_WINDOW:String = "open poll main window event";
    public static const CLOSE_WINDOW:String = "close poll main window event";
    
    public function PollMainWindowEvent(type:String)
    {
      super(type, true, false);
    }
  }
}