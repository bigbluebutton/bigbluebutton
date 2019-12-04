package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class ShowPollResultEvent extends Event
  {
    
    public static const SHOW_POLL_RESULT:String = "show poll result";
    
    public function ShowPollResultEvent()
    {
      super(SHOW_POLL_RESULT, true, false);
    }
  }
}