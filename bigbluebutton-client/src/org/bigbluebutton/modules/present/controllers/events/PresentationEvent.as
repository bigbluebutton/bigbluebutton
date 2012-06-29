package org.bigbluebutton.modules.present.controllers.events
{
    import flash.events.Event;
    
    public class PresentationEvent extends Event
    {
        public static const PRESENTATION_NOT_FOUND:String = "presentation not found";
        
        public var presentationID:String;
        
        public function PresentationEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}