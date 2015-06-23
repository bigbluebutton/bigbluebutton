package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class PollStartedEvent extends Event
  {
    public static const POLL_STARTED:String = "poll started";
    
    public var pollId:String;
    
    public function PollStartedEvent(pollId:String)
    {
      super(POLL_STARTED, true, false);
      this.pollId = pollId;
    }
  }
}