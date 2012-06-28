package org.bigbluebutton.core.services
{
    import flash.events.Event;
    import flash.events.IEventDispatcher;
    import flash.events.ProgressEvent;
    import flash.system.ApplicationDomain;
    
    import mx.events.ModuleEvent;
    import mx.modules.ModuleLoader;
    
    import org.bigbluebutton.common.IBigBlueButtonModule;
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.ModuleLoadErrorEvent;
    import org.bigbluebutton.core.controllers.events.ModuleLoadProgressEvent;
    import org.bigbluebutton.core.controllers.events.ModuleLoadedEvent;
    import org.bigbluebutton.core.model.ModuleDescriptor;
    
    public class ModuleLoaderService
    {
        private var _module:ModuleDescriptor;
        private var _dispatcher:IEventDispatcher;
        private var _loader:ModuleLoader = new ModuleLoader();
        
        public function load(module:ModuleDescriptor, dispatcher:IEventDispatcher):void { 
            _module = module;
            _dispatcher = dispatcher;
            
            _loader.applicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);
            _loader.addEventListener("loading", onLoading);
            _loader.addEventListener(ModuleEvent.PROGRESS, onLoadProgress);
            _loader.addEventListener(ModuleEvent.READY, onReady);
            _loader.addEventListener(ModuleEvent.ERROR, onErrorLoading);
            _loader.url = module.attributes.url;
            LogUtil.debug("Loading " + _loader.url);
            _loader.loadModule();
        }
        
        private function onReady(event:Event):void {
            LogUtil.debug("Module on ready event. [" + _module.name + "]");
            
            var modLoader:ModuleLoader = event.target as ModuleLoader;
            
            if (!(modLoader.child is IBigBlueButtonModule)) {
                LogUtil.error("Invalid module error. [" + _module.name + "]");
                var errorEvent:ModuleLoadErrorEvent = new ModuleLoadErrorEvent(ModuleLoadErrorEvent.INVALID_MODULE_ERROR_EVENT);
                _dispatcher.dispatchEvent(errorEvent);
            }
            
            var bbb_module:IBigBlueButtonModule = modLoader.child as IBigBlueButtonModule;
            
            if (bbb_module != null) {
                _module.module = bbb_module;
                _module.loaded = true;
                LogUtil.debug("Module has been loaded. [" + _module.name + "]");
                var evt:ModuleLoadedEvent = new ModuleLoadedEvent(ModuleLoadedEvent.MODULE_LOADED_EVENT);
                evt.name = _module.name;
                _dispatcher.dispatchEvent(evt);
            } else {
                LogUtil.error("Failed to load module. [" + _module.name + "]");
                var loadErrorEvent:ModuleLoadErrorEvent = new ModuleLoadErrorEvent(ModuleLoadErrorEvent.FAILED_TO_LOAD_MODULE_ERROR_EVENT);
                LogUtil(loadErrorEvent);
            }            
        }	
        
        private function onLoadProgress(e:ProgressEvent):void {
            var event:ModuleLoadProgressEvent = new ModuleLoadProgressEvent(ModuleLoadProgressEvent.MODULE_LOAD_PROGRESS_EVENT);
            event.moduleName = _module.name;
            event.percentLoaded = Math.round((e.bytesLoaded/e.bytesTotal) * 100);
//            LogUtil.debug("Module loading progress [" + _module.name + "] " + event.percentLoaded + "%" );
            _dispatcher.dispatchEvent(event);
        }	
        
        private function onErrorLoading(e:ModuleEvent):void{
            LogUtil.error("Error loading module. [" + _module.name + "]");
            var loadErrorEvent:ModuleLoadErrorEvent = new ModuleLoadErrorEvent(ModuleLoadErrorEvent.FAILED_TO_LOAD_MODULE_ERROR_EVENT);
            _dispatcher.dispatchEvent(loadErrorEvent);
        }
        
        private function onLoading(e:Event):void{
            LogUtil.debug("Module on loading event. [" + _module.name + "]");
        }
    }
}