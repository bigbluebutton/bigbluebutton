package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class BreakoutRoomsReadyEvent extends Event
  {
    public static const BREAKOUT_ROOMS_READY_EVENT: String = "breakout rooms ready event";
    
    public function BreakoutRoomsReadyEvent()
    {
      super(BREAKOUT_ROOMS_READY_EVENT, true, false);
    }
  }
}