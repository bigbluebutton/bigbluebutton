package org.bigbluebutton.core.services
{
    import flash.events.IEventDispatcher;
    
    import mx.events.ResourceEvent;
    import mx.resources.ResourceManager;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.LocaleEvent;
    import org.bigbluebutton.core.model.LocaleModel;

    public class LocaleLoaderService
    {
        private var _dispatcher:IEventDispatcher;     
        private var _localeBeingLoaded:String;
        
        public function LocaleLoaderService(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
               
        public function loadLocaleResource(locale:String):void {    
            LogUtil.debug("Loading " + locale + " locale.");
            // Add a random string on the query so that we don't get a cached version.            
            var date:Date = new Date();
            var localeURI:String = 'locale/' + locale + '_resources.swf?a=' + date.time;            
            
            // Store the locale being loaded. We need this to dispatch when we get the loading result.
            _localeBeingLoaded = locale;
            
            var _resEventDispatcher:IEventDispatcher = ResourceManager.getInstance().loadResourceModule(localeURI, false);
            _resEventDispatcher.addEventListener(ResourceEvent.COMPLETE, localeChangeComplete);
            _resEventDispatcher.addEventListener(ResourceEvent.ERROR, handleResourceNotLoaded);
        }
        
        private function localeChangeComplete(event:ResourceEvent):void {
            LogUtil.debug("Locale " + _localeBeingLoaded + " has been load.");
            var e: LocaleEvent = new LocaleEvent(LocaleEvent.LOAD_LOCALE_SUCCEEDED_LOADED_EVENT);
            e.loadedLocale = _localeBeingLoaded;
            _dispatcher.dispatchEvent(e);
        }
        
        
        private function handleResourceNotLoaded(event:ResourceEvent):void{
            LogUtil.debug("Locale " + _localeBeingLoaded + " failed to load.");
            var e: LocaleEvent = new LocaleEvent(LocaleEvent.LOAD_LOCALE_FAILED_EVENT);
            e.loadedLocale = _localeBeingLoaded;
            _dispatcher.dispatchEvent(e);
        }
    }
}