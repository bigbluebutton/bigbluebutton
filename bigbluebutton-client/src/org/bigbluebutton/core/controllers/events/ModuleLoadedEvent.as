package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ModuleLoadedEvent extends Event
    {
        public static const MODULE_LOADED_EVENT:String = "module loaded event";
        public static const ALL_MODULES_LOADED_EVENT:String = "all modules loaded event";
        
        public var name:String;
        
        public function ModuleLoadedEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}