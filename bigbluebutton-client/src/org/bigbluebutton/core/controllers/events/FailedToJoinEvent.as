package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class FailedToJoinEvent extends Event
    {
        public static const FAILED_TO_JOIN_EVENT:String = "failed to join event";
        
        public var logoutURL:String;
        
        public function FailedToJoinEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(FAILED_TO_JOIN_EVENT, bubbles, cancelable);
        }
    }
}