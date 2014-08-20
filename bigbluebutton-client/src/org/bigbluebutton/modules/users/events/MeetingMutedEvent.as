package org.bigbluebutton.modules.users.events
{
  import flash.events.Event;
  
  public class MeetingMutedEvent extends Event
  {
    public static const MEETING_MUTED:String = "meeting muted event";
    
    public function MeetingMutedEvent()
    {
      super(MEETING_MUTED, true, false);
    }
  }
}