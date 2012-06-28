package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class GotAllUsersEvent extends Event
    {
        public static const GOT_ALL_USERS_EVENT:String = "got all users event";
        
        public function GotAllUsersEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(GOT_ALL_USERS_EVENT, bubbles, cancelable);
        }
    }
}