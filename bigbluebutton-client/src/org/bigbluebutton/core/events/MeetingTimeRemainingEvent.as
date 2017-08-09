package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class MeetingTimeRemainingEvent extends Event
  {
    public static const TIME_REMAINING:String = "meeting time remaining event";
    
    public var timeLeftInSec:int;
    
    public function MeetingTimeRemainingEvent(timeLeftInSec:int)
    {
      super(TIME_REMAINING, false, false);
      this.timeLeftInSec = timeLeftInSec;
    }
  }
}