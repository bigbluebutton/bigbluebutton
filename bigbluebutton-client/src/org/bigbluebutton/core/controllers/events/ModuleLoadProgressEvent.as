package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class ModuleLoadProgressEvent extends Event
    {
        public static const MODULE_LOAD_PROGRESS_EVENT:String = "module load progress event";
        
        public var moduleName:String;
        public var percentLoaded:Number;
        
        public function ModuleLoadProgressEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}