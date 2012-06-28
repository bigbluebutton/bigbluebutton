package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ConnectedToRed5Event extends Event
    {
        public static const CONNECTED_TO_RED5_EVENT:String = "connected to red5 event";
        
        public function ConnectedToRed5Event(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(CONNECTED_TO_RED5_EVENT, bubbles, cancelable);
        }
    }
}