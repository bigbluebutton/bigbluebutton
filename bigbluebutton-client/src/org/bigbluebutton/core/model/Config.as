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

		public function get help():Object {
			var help:Object = new Object();
			help.url = config.help.@url;
			return help;
		}
    
    public function get javaTest():Object {
      var javaTest:Object = new Object();
      javaTest.url = config.javaTest.@url;
      return javaTest;
    }
			
		public function get locale():Object {
			var v:Object = new Object();
			v.version = config.localeversion;
			v.suppressWarning = config.localeversion.@suppressWarning;
			return v;
		}
			
		public function get version():String {
			return config.version;
		}
			
		public function get porttest():Object {
			var p:Object = new Object();
			p.host = config.porttest.@host;
			p.application = config.porttest.@application;
			p.timeout = config.porttest.@timeout;
			return p;
		}
			
		public function get application():Object {
			var a:Object = new Object();
			a.uri = config.application.@uri;
			a.host = config.application.@host;
			return a;
		}
		
		public function get language():Object {
			var a:Object = new Object();
			a.userSelectionEnabled = ((config.language.@userSelectionEnabled).toUpperCase() == "TRUE") ? true : false;
			return a
		}
		
		public function get shortcutKeys():Object {
			var a:Object = new Object();
			a.showButton = ((config.shortcutKeys.@showButton).toUpperCase() == "TRUE") ? true : false;
			return a
		}
			
		public function get skinning():Object {
			var a:Object = new Object();
			a.enabled = ((config.skinning.@enabled).toUpperCase() == "TRUE") ? true : false;
			a.url = config.skinning.@url;
			return a
		}
		
		public function get browserVersions():XML {
			return new XML(config.browserVersions.toXMLString());
		}

	    public function get layout():XML {
	      return new XML(config.layout.toXMLString());
	    }
    	
		public function get meeting():XML {
			return new XML(config.meeting.toXMLString());
		}

		public function get logging():XML {
			return new XML(config.logging.toXMLString());
		}
		
		public function get breakoutRooms():XML {
			return new XML(config.breakoutRooms.toXMLString());
		}
		
		public function get lock():XML {
			if(config.lock == null) return null;
			return new XML(config.lock.toXMLString());
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