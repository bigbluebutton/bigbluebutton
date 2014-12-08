package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class PollResultWindowEvent extends Event
  {
    public static const CLOSE_WINDOW:String = "close poll result window";
    
    public function PollResultWindowEvent()
    {
      super(CLOSE_WINDOW, true, false);
    }
   
  }
}