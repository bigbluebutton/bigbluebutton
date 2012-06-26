package org.bigbluebutton.core.model
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.core.services.LocaleLoaderService;

    public class Locale
    {
        private var _code:String;
        private var _name:String;
        
        private var _loader:LocaleLoaderService;
        private var _dispatcher:IEventDispatcher;
        
        public function Locale(code:String, name:String, dispatcher:IEventDispatcher)
        {
            _code = code;
            _name = name;
            _dispatcher = dispatcher;
        }
        
        public function get code():String 
        {
            return _code;    
        }
        
        public function get name():String {
            return _name;
        }
        
        public function load():void {
            _loader = new LocaleLoaderService(_dispatcher);
            _loader.loadLocaleResource(_code);
        }
    }
}