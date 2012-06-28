package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class JoinErrorEvent extends Event
    {
        public static const JOIN_ERROR_EVENT:String = "join error event";
        
        public function JoinErrorEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(JOIN_ERROR_EVENT, bubbles, cancelable);
        }
    }
}