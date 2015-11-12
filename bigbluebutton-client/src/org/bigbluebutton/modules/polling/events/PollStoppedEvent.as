package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.model.SimplePoll;
  
  public class PollStoppedEvent extends Event
  {
    public static const POLL_STOPPED:String = "poll stopped";
        
    public function PollStoppedEvent()
    {
      super(POLL_STOPPED, true, false);
    }
  }
}