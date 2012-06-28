package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ListeningForUserMessagesEvent extends Event
    {
        public static const LISTENING_FOR_USER_MESSAGES_EVENT:String = "listening for user message event";
        
        public function ListeningForUserMessagesEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(LISTENING_FOR_USER_MESSAGES_EVENT, bubbles, cancelable);
        }
    }
}