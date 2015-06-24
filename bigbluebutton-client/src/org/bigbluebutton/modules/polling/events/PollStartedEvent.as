package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.model.SimplePoll;
  
  public class PollStartedEvent extends Event
  {
    public static const POLL_STARTED:String = "poll started";
    
    public var poll:SimplePoll;
    
    public function PollStartedEvent(poll:SimplePoll)
    {
      super(POLL_STARTED, true, false);
      this.poll = poll;
    }
  }
}