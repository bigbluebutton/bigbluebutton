package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class NewGuestWaitingEvent extends Event
  {
    public static const NEW_GUEST_WAITING: String = "new guests waiting event";

    public function NewGuestWaitingEvent()
    {
      super(NEW_GUEST_WAITING, false, false);
    }
  }
}