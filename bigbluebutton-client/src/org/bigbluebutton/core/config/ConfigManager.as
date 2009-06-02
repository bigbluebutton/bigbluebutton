package org.bigbluebutton.core.config
{
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.main.model.ModuleDescriptor;
	
	public class ConfigManager
	{
		private var _numModules:int = 0;		
		private var _modules:Dictionary = new Dictionary();
		private var _mode:String;
		private var _portTest:Object;
				
		public function parseConfig(xml:XML):Object{
			trace(xml);
			var list:XMLList = xml.module;
			var item:XML;
						
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				_modules[item.@name] = mod;
				_numModules++;
			}		
			var info:Object = new Object();
			info.numberOfModules = _numModules;
			info.moduleDescriptors = _modules;
			
			return info;  		
		}
		
		public function parseModules(configs:XML):Object {
			var modules:XMLList = configs.modules.module;
			var module:XML;
			trace("modules:\n" + modules);
			for each(module in modules)
			{
				trace("Processing: " + module.@name);
				var mod:ModuleDescriptor = new ModuleDescriptor(module);
				_modules[module.@name] = mod;
				_numModules++;
			}
			var info:Object = new Object();
			info.numberOfModules = _numModules;
			info.moduleDescriptors = _modules;
			
			return info;  
		}
		
		public function parsePortTest(configs:XML):void {
			_portTest = new Object();
			_portTest['host'] = configs.porttest.@host;
			_portTest['application'] = configs.porttest.@application;
		}
		
		public function get portTestHost():String {
			return _portTest['host'];
		}
		
		public function get portTestApplication():String {
			return _portTest['application'];
		}
		
		public function get numberOfModules():Number {
			return _numModules;
		}
		
		
		
		public function get moduleDescriptors():Dictionary {
			return _modules;
		}
	}
}