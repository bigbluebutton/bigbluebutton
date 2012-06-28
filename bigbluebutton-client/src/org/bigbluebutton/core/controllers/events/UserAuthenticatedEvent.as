package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class UserAuthenticatedEvent extends Event
    {
        public static const USER_AUTHENTICATED_EVENT:String = "user authenticated event";
        
        public function UserAuthenticatedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(USER_AUTHENTICATED_EVENT, bubbles, cancelable);
        }
    }
}