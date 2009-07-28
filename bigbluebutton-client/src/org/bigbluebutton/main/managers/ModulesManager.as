package org.bigbluebutton.main.managers
{
	import flash.events.IEventDispatcher;
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.main.events.ModuleEvent;
	
	public class ModulesManager
	{
		private var _numberOfModules:Number;
		private var _moduleDescriptors:Dictionary;
		
		/** This property is injected by the application. */
		public var dispatcher : IEventDispatcher;
		
		public function ModulesManager()
		{
		}

		public function numberOfModules(num:Number):void {
			_numberOfModules = num;
		}
		
		public function moduleDescriptors(descriptors:Dictionary):void {
			_moduleDescriptors = descriptors;
		}
		
		public function loadFirstModule():void {
			for (var key:Object in _moduleDescriptors) {				
				var m:ModuleDescriptor = _moduleDescriptors[key] as ModuleDescriptor;
				if (m.getAttribute("onAppInitEvent") != null) {
					m.load(dispatcher);
				}
			}
		}
		
		public function loadNextModule(justLoadedModule:String):void {
			var m:ModuleDescriptor = getModule(justLoadedModule);
			if (m != null) {
				var nextModule:String = m.getAttribute("loadNextModule") as String;
				if (nextModule != null) {
					LogUtil.debug("Loading " + nextModule + " next.");
					var nextModuleToLoad:ModuleDescriptor = getModule(nextModule);
					nextModuleToLoad.load(dispatcher);
				} else {
					LogUtil.debug("All modules have been loaded - " + m.getAttribute("name") as String);
					dispatcher.dispatchEvent(new ModuleEvent(ModuleEvent.ALL_MODULES_LOADED_EVENT));
				}
			}
		}
		
		private function getModule(name:String):ModuleDescriptor {
			for (var key:Object in _moduleDescriptors) {				
				var m:ModuleDescriptor = _moduleDescriptors[key] as ModuleDescriptor;
				if (m.getAttribute("name") == name) {
					return m;
				}
			}		
			return null;	
		}
	}
}