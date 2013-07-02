package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class OpenCreatePollWindowEvent extends Event
  {
    public static const OPEN_CREATE_POLL_WINDOW:String = "open create poll window event";
    
    public function OpenCreatePollWindowEvent()
    {
      super(OPEN_CREATE_POLL_WINDOW, true, false);
    }
  }
}