package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class BreakoutRoomsListUpdatedEvent extends Event
  {
    public static const BREAKOUT_ROOMS_LIST_UPDATED_EVENT: String = "breakout rooms list updated event";
    
    public function BreakoutRoomsListUpdatedEvent()
    {
      super(BREAKOUT_ROOMS_LIST_UPDATED_EVENT, false, false);
    }
  }
}