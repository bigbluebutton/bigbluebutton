/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.core.model
{
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.main.model.modules.ModuleDescriptor;

	public class Config
	{
		private var config:XML = null;
		private var _modules:Dictionary;
		private var _numModules:int;
		
		public function Config(config:XML)
		{
			this.config = config;
			buildModuleDescriptors();
		}

		public function get version():String {
			return config.version;
		}
			
		public function isModulePresent(name:String):Boolean {
			var mn:XMLList = config.modules..@name;
			var found:Boolean = false;
			
			for each (var n:XML in mn) {
				if (n.toString().toUpperCase() == name.toUpperCase()) {
					found = true;
					break;
				}
			}	
			return found;
		}
		
		public function numberOfModules():int {
			return _numModules;
		}
		
		public function getConfigFor(moduleName:String):XML {
			if (isModulePresent(moduleName)) {
					return new XML(config.modules.module.(@name.toUpperCase() == moduleName.toUpperCase()).toXMLString());
			}
			return null;
		}
		
		public function getOptionsFor(name:String) : XML {
			return new XML(config[name].toXMLString());
		}
		
		public function getModules():Dictionary{
			return _modules;
		}
		
		public function getModulesXML():XMLList{
			return config.modules.module;
		}
		
		private function buildModuleDescriptors():Dictionary{	
			_modules = new Dictionary();
			var list:XMLList = getModulesXML();
			var item:XML;
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				_modules[item.@name] = mod;
				_numModules++;
			}
			return _modules;
		}
		
		public function getModuleFor(name:String):ModuleDescriptor {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getName() == name) {
					return m;
				}
			}		
			return null;	
		}
	}
}