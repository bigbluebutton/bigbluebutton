package org.bigbluebutton.modules.present.controllers.events
{
    import flash.events.Event;
    
    public class GotoPreviousPageEvent extends Event
    {
        public static const GOTO_PREVIOUS_PAGE_EVENT:String = "go to previous page event";
        
        public function GotoPreviousPageEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(GOTO_PREVIOUS_PAGE_EVENT, bubbles, cancelable);
        }
    }
}