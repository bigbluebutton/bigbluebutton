package org.bigbluebutton.main.model
{
	import flash.events.Event;
	
	import mx.modules.ModuleLoader;

	public class BbbModuleLoader extends ModuleLoader
	{
		private var moduleName:String;
		
		public function BbbModuleLoader(moduleName:String)
		{
			super();
			this.moduleName = moduleName;
			
			addEventListener("urlChanged", onUrlChanged);
			addEventListener("loading", onLoading);
			addEventListener("progress", onProgress);
			addEventListener("setup", onSetup);
			addEventListener("ready", onReady);
			addEventListener("error", onError);
			addEventListener("unload", onUnload);
		}

			public function onUrlChanged(event:Event):void {
				trace("Module onUrlChanged Event");
			}
			
			public function onLoading(event:Event):void {
				trace("Module onLoading Event");
			}
			
			public function onProgress(event:Event):void {
				trace("Module onProgress Event");
			}			

			public function onSetup(event:Event):void {
				trace("Module onSetup Event");
			}	

			public function onReady(event:Event):void {
				trace("Module onReady Event");
			}	

			public function onError(event:Event):void {
				trace("Module onError Event");
			}

			public function onUnload(event:Event):void {
				trace("Module onUnload Event");
			}		
	}
}