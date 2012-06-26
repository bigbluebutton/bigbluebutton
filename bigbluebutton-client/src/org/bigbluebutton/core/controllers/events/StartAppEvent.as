package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class StartAppEvent extends Event
    {
        public static const START_APP_EVENT:String = "start app event";
        
        public function StartAppEvent(bubbles:Boolean=true, cancelable:Boolean=true)
        {
            super(START_APP_EVENT, bubbles, cancelable);
        }
    }
}