package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ModuleLoadErrorEvent extends Event
    {
        public static const INVALID_MODULE_ERROR_EVENT:String = "invalid module error event"; 
        public static const FAILED_TO_LOAD_MODULE_ERROR_EVENT:String = "failed to load module error event";    
        
        public function ModuleLoadErrorEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}