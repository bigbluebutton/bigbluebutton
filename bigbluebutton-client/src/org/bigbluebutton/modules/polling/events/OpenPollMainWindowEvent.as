package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class OpenPollMainWindowEvent extends Event
  {
    public static const OPEN_POLL_MAIN_WINDOW:String = "open poll main window event";
    
    public function OpenPollMainWindowEvent()
    {
      super(OPEN_POLL_MAIN_WINDOW, true, false);
    }
  }
}