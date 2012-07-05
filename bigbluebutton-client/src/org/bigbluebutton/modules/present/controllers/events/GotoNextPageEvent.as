package org.bigbluebutton.modules.present.controllers.events
{
    import flash.events.Event;
    
    public class GotoNextPageEvent extends Event
    {
        public static const GOTO_NEXT_PAGE_EVENT:String = "go to next page event";
        
        public function GotoNextPageEvent(bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(GOTO_NEXT_PAGE_EVENT, bubbles, cancelable);
        }
    }
}