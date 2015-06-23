package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class ShowPollResultEvent extends Event
  {
    
    public static const SHOW_POLL_RESULT:String = "show poll result";
    
    public var pollId: String;
    public var show: Boolean;
    
    public function ShowPollResultEvent(pollId:String, show:Boolean)
    {
      super(SHOW_POLL_RESULT, true, false);
      this.pollId = pollId;
      this.show = show;
    }
  }
}