package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class ShowPollResultEvent extends Event
  {
    
    public static const SHOW_POLL_RESULT:String = "show poll result";
    
    public var show: Boolean;
    
    public function ShowPollResultEvent(show:Boolean)
    {
      super(SHOW_POLL_RESULT, true, false);
      this.show = show;
    }
  }
}