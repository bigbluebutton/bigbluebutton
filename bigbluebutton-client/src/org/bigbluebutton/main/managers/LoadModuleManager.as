package org.bigbluebutton.main.managers
{
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.events.ProgressEvent;
	
	import mx.modules.ModuleLoader;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.main.events.ModuleEvent;

	public class LoadModuleManager //extends EventDispatcher
	{
		private var _loader:ModuleLoader;
		private var _moduleDescriptor:ModuleDescriptor;
		
		/** This property is injected by the application. */
		public var dispatcher : IEventDispatcher;
		
		public function LoadModuleManager()
		{
			_loader = new ModuleLoader();
		}

		public function load(module:ModuleDescriptor):void {
			_moduleDescriptor = module;
//			loader.addEventListener("urlChanged", resultHandler);
//			loader.addEventListener("loading", resultHandler);
			_loader.addEventListener("progress", onLoadProgress);
//			loader.addEventListener("setup", resultHandler);
			_loader.addEventListener("ready", onReady);
//			loader.addEventListener("error", resultHandler);
//			loader.addEventListener("unload", resultHandler);
			_loader.url = _moduleDescriptor.getAttribute('url') as String;
			_loader.loadModule();
		}
		
		public function unload():void {
			_loader.url = "";
		}

		private function onReady(event:Event):void {
			LogUtil.debug("Module onReady Event");
			var modLoader:ModuleLoader = event.target as ModuleLoader;
			var loadedModule:IBigBlueButtonModule = modLoader.child as IBigBlueButtonModule;
			var moduleName:String = String(_moduleDescriptor.getAttribute('name'));
			
			if (loadedModule != null) {
//				_moduleDescriptor.module = loadedModule;
				LogUtil.debug("Module " + moduleName + " has been loaded");
//				_moduleDescriptor.loaded = true;
				
				var loadEvent:ModuleEvent = new ModuleEvent(ModuleEvent.MODULE_LOADED_EVENT);
				loadEvent.moduleName = moduleName;
				dispatcher.dispatchEvent(loadEvent);				
			} else {
				LogUtil.error("Failed to load module: " + moduleName );
				
				var loadErrorEvent:ModuleEvent = new ModuleEvent(ModuleEvent.MODULE_LOAD_ERROR_EVENT);
				loadErrorEvent.moduleName = moduleName;
				loadErrorEvent.message = "Failed to load " + moduleName;
				dispatcher.dispatchEvent(loadErrorEvent);
			}			
		}	

		private function onLoadProgress(e:ProgressEvent):void {
			var loadProgressEvent:ModuleEvent = new ModuleEvent(ModuleEvent.MODULE_LOAD_PROGRESS_EVENT);
			loadProgressEvent.moduleName = String(_moduleDescriptor.getAttribute('name'));
			loadProgressEvent.percentLoaded = Math.round((e.bytesLoaded/e.bytesTotal) * 100);
			dispatcher.dispatchEvent(loadProgressEvent);
		}	
		
/*
		private function onUrlChanged(event:Event):void {
			LogUtil.debug("Module onUrlChanged Event");
			callbackHandler(event);
		}
			
		private function onLoading(event:Event):void {
			LogUtil.debug("Module onLoading Event");
			callbackHandler(event);
		}
			
		private function onProgress(event:Event):void {
			LogUtil.debug("Module onProgress Event");
			callbackHandler(event);
		}			

		private function onSetup(event:Event):void {
			LogUtil.debug("Module onSetup Event");
			callbackHandler(event);
		}	



		private function onError(event:Event):void {
			LogUtil.debug("Module onError Event");
			callbackHandler(event);
		}

		private function onUnload(event:Event):void {
			LogUtil.debug("Module onUnload Event");
			callbackHandler(event);
		}		
*/		
	}
}