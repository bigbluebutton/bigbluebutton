package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ConfigLoadEvent extends Event
    {
        public static const CONFIG_LOADED_EVENT:String = "bbb config loaded event";
        public static const CONFIG_LOAD_ERROR_EVENT:String = "bbb config load error event";
		
        public var config:XML;
        
        public function ConfigLoadEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}