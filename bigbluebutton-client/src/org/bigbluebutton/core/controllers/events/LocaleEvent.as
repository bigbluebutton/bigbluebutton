package org.bigbluebutton.core.controllers.events
{
    import flash.events.Event;
    
    public class LocaleEvent extends Event
    {
        public static const LIST_OF_AVAILABLE_LOCALES_LOADED_EVENT:String = "list of avail locale loaded event";
        public static const LOAD_LOCALE_SUCCEEDED_LOADED_EVENT:String = "locale loaded success event";
        public static const LOAD_LOCALE_FAILED_EVENT:String = "load locale failed event";
        public static const LOAD_MASTER_LOCALE_SUCCEEDED_EVENT:String = "load locale master event";
        public static const LOAD_PREFERRED_LOCALE_SUCCEEDED_EVENT:String = "load locale preferred event";
        public static const LOCALE_VERSION_MATCH_EVENT:String = "locale version matches event";
        public static const LOCALE_VERSION_DO_NOT_MATCH_EVENT:String = "locale version do not match event";
        
        public var loadedLocale: String;
        
        public function LocaleEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
        {
            super(type, bubbles, cancelable);
        }
    }
}