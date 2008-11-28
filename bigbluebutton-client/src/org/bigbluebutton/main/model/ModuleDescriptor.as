package org.bigbluebutton.main.model
{
	import flash.events.Event;
	import flash.events.ProgressEvent;
	
	import mx.modules.ModuleLoader;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.main.MainApplicationConstants;
	
	public class ModuleDescriptor
	{
		public var attributes:Object;
		public var loader:ModuleLoader;
		public var module:IBigBlueButtonModule;
		public var loaded:Boolean = false;
		public var started:Boolean = false;
		public var connected:Boolean = false;
		
		private var callbackHandler:Function;
		
		public function ModuleDescriptor(attributes:Object)
		{
			this.attributes = attributes;
			
			loader = new ModuleLoader();
		}

		public function load(resultHandler:Function):void {
			callbackHandler = resultHandler;
//			loader.addEventListener("urlChanged", resultHandler);
//			loader.addEventListener("loading", resultHandler);
			loader.addEventListener("progress", onLoadProgress);
//			loader.addEventListener("setup", resultHandler);
			loader.addEventListener("ready", onReady);
//			loader.addEventListener("error", resultHandler);
//			loader.addEventListener("unload", resultHandler);
			loader.url = attributes.url;
			loader.loadModule();
		}
		
		public function unload():void {
			loader.url = "";
		}

		private function onReady(event:Event):void {
			LogUtil.debug("Module onReady Event");
			var loader:ModuleLoader = event.target as ModuleLoader;
			module = loader.child as IBigBlueButtonModule;
			if (module != null) {
				LogUtil.debug("Module " + attributes.name + " has been loaded");
				loaded = true;
			}
			callbackHandler(MainApplicationConstants.MODULE_LOAD_READY, attributes.name);
		}	

		private function onLoadProgress(e:ProgressEvent):void {
			//var loader:ModuleLoader = e.target as ModuleLoader;
			//module = loader.child as IBigBlueButtonModule;
			//if (module != null) {
				callbackHandler(MainApplicationConstants.MODULE_LOAD_PROGRESS, attributes.name, Math.round((e.bytesLoaded/e.bytesTotal) * 100));
			//}
			
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