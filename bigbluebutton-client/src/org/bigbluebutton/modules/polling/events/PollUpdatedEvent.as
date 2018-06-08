package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.model.SimplePoll;
  import org.bigbluebutton.modules.polling.model.SimplePollResult;
  
  public class PollUpdatedEvent extends Event
  {
    public static const POLL_UPDATED:String = "poll updated";
    
    public var result:SimplePollResult;
    
    public function PollUpdatedEvent(result:SimplePollResult)
    {
      super(POLL_UPDATED, true, false);
      this.result = result;
    }
  }
}