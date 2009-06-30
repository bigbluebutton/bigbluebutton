/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
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