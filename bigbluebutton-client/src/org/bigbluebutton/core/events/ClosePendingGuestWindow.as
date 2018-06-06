package org.bigbluebutton.core.events
{
    import flash.events.Event;
    
    public class ClosePendingGuestWindow extends Event
    {
        public static const CLOSE_PENDING_GUEST_WINDOW: String = "CLOSE_PENDING_GUEST_WINDOW";
    
        public function ClosePendingGuestWindow()
        {
            super(CLOSE_PENDING_GUEST_WINDOW, false, false);
        }
    }
}
