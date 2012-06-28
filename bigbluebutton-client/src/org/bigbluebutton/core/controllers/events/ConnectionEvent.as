package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ConnectionEvent extends Event
    {
        public static const CONNECTION_NETWORK_CHANGE_EVENT:String = "bbb connection network change event";
        public static const UNKNOWN_REASON:String = "unknownReason";
        public static const CONNECTION_FAILED:String = "connectionFailed";
        public static const CONNECTION_CLOSED:String = "connectionClosed";
        public static const INVALID_APP:String = "invalidApp";
        public static const APP_SHUTDOWN:String = "appShutdown";
        public static const CONNECTION_REJECTED:String = "connectionRejected";
        public static const ASYNC_ERROR:String = "asyncError";
        public static const USER_LOGGED_OUT:String = "userHasLoggedOut";
        
        public function ConnectionEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}