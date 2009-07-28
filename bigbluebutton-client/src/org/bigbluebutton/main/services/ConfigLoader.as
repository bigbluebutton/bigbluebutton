package org.bigbluebutton.main.services
{
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.main.managers.ModuleDescriptor;
	
	public class ConfigLoader {
		
		private var _numModules:int = 0;		
		private var _modules:Dictionary = new Dictionary();
		private var _mode:String;
				
		public function setMode(m:String):void {
			_mode = m;
		}		
		
		public function parse(xml:XML):Object{
			var list:XMLList = xml.module;
			var item:XML;
						
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				// Add the mode (LIVE,PLAYBACK) attribute to the module.
				mod.addAttribute('mode', _mode);
				
				_modules[item.@name] = mod;
				_numModules++;
			}		
			var info:Object = new Object();
			info.numberOfModules = _numModules;
			info.moduleDescriptors = _modules;
			
			return info;  		
		}
		
		public function get numberOfModules():Number {
			return _numModules;
		}
		
		public function get moduleDescriptors():Dictionary {
			return _modules;
		}
	}
}