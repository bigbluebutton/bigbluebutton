package org.bigbluebutton.core.services
{
    import flash.events.Event;
    import flash.events.IEventDispatcher;
    import flash.events.IOErrorEvent;
    import flash.events.SecurityErrorEvent;
    import flash.net.URLLoader;
    import flash.net.URLRequest;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.LocaleEvent;
    import org.bigbluebutton.core.model.LocaleModel;

    public class LocaleConfigLoader
    {
        public static const LOCALES_FILE:String = "conf/locales.xml";
        
        private var _localeModel:LocaleModel;
        private var _dispatcher:IEventDispatcher;
        
        public function LocaleConfigLoader(dispatcher:IEventDispatcher, localeModel:LocaleModel)
        {
            _dispatcher = dispatcher;
            _localeModel = localeModel;
            determineAvailableLocales();
        }
       
        private function determineAvailableLocales():void {            
            var _urlLoader:URLLoader = new URLLoader();
            _urlLoader.addEventListener(Event.COMPLETE, handleComplete);
            _urlLoader.addEventListener(IOErrorEvent.IO_ERROR, handleIOErrorEvent);
            _urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleSecurityErrorEvent);
            
            // Add a random string on the query so that we always get an up-to-date config.xml
            var date:Date = new Date();            
            _urlLoader.load(new URLRequest(LOCALES_FILE + "?a=" + date.time));
        }
        
        private function handleComplete(e:Event):void {
            parse(new XML(e.target.data));		
        }
        
        private function parse(xml:XML):void {		 	
            var list: XMLList = xml.locale;
            var locale: XML;
            
            for each(locale in list){
                _localeModel.addLocale(locale.@code, locale.@name);
            }				
            LogUtil.debug("Locale config loaded successfully.");
            _dispatcher.dispatchEvent(new LocaleEvent(LocaleEvent.LIST_OF_AVAILABLE_LOCALES_LOADED_EVENT));
        }
        
        private function handleIOErrorEvent(e: Event):void {
            LogUtil.error("Locale config load io error event.");
            _dispatcher.dispatchEvent(new LocaleEvent(LocaleEvent.LOAD_LOCALE_FAILED_EVENT));
        }
        
        private function handleSecurityErrorEvent(e: Event):void {
            LogUtil.error("Locale config load security error event.");
            _dispatcher.dispatchEvent(new LocaleEvent(LocaleEvent.LOAD_LOCALE_FAILED_EVENT));
        }
    }
}