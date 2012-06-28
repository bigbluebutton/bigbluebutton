package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class UserEvent extends Event
    {
        
        
        public function UserEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}