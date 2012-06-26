package org.bigbluebutton.core.services
{
    import flash.events.Event;
    import flash.events.IEventDispatcher;
    import flash.events.IOErrorEvent;
    import flash.events.SecurityErrorEvent;
    import flash.net.URLLoader;
    import flash.net.URLRequest;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.ConfigLoadEvent;

    public class ConfigLoaderService
    {
        public static const LOCALES_FILE:String = "conf/config.xml";
        private var _dispatcher:IEventDispatcher;
        
        public function ConfigLoaderService(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public var moduleParser:ConfigToModuleDataParser;
        
        public function loadConfig():void {            
            LogUtil.debug("Loading config.");
            var _urlLoader:URLLoader = new URLLoader();
            _urlLoader.addEventListener(Event.COMPLETE, handleComplete);
            _urlLoader.addEventListener(IOErrorEvent.IO_ERROR, handleIOErrorEvent);
            _urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleSecurityErrorEvent);
            
            // Add a random string on the query so that we always get an up-to-date config.xml
            var date:Date = new Date();            
            _urlLoader.load(new URLRequest(LOCALES_FILE + "?a=" + date.time));
        }
        
        private function handleComplete(e:Event):void {
            LogUtil.debug("Loading config complete.");
            var configEvent:ConfigLoadEvent = new ConfigLoadEvent(ConfigLoadEvent.CONFIG_LOADED_EVENT);
            configEvent.config = new XML(e.target.data);
            _dispatcher.dispatchEvent(configEvent);
        }
        
        private function handleIOErrorEvent(e: Event):void {
            LogUtil.debug("Loading config io error.");
            _dispatcher.dispatchEvent(new ConfigLoadEvent(ConfigLoadEvent.CONFIG_LOAD_ERROR_EVENT));
        }
        
        private function handleSecurityErrorEvent(e: Event):void {
            LogUtil.debug("Loading config security error.");
            _dispatcher.dispatchEvent(new ConfigLoadEvent(ConfigLoadEvent.CONFIG_LOAD_ERROR_EVENT));
        }
    }
}