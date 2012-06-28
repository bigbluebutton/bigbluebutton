package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class UserStatusChangeEvent extends Event
    {
        public static const USER_STATUS_CHANGE_EVENT:String = "user status change event";
        
        public var oldStatus:Object;
        public var newStatus:Object;
        public var userid:String;
        
        public function UserStatusChangeEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(USER_STATUS_CHANGE_EVENT, bubbles, cancelable);
        }
    }
}