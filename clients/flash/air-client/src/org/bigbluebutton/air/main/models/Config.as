package org.bigbluebutton.air.main.models {
	
	public class Config {
		private var _config:XML;
		
		public function Config(config:XML) {
			_config = config;
		}
		
		public function get help():Object {
			var help:Object = new Object();
			help.url = _config.help.@url;
			return help;
		}
		
		public function get javaTest():Object {
			var javaTest:Object = new Object();
			javaTest.url = _config.javaTest.@url;
			return javaTest;
		}
		
		public function get locale():Object {
			var v:Object = new Object();
			v.version = _config.localeversion;
			return v;
		}
		
		public function get version():String {
			return _config.version;
		}
		
		public function get displayAvatar():Boolean {
			return (String(getConfigFor("VideoConfModule").@displayAvatar).toUpperCase() == 'TRUE');
		}
		
		public function get porttest():Object {
			var p:Object = new Object();
			p.host = _config.porttest.@host;
			p.application = _config.porttest.@application;
			return p;
		}
		
		public function get application():Object {
			var a:Object = new Object();
			a.uri = _config.application.@uri;
			a.host = _config.application.@host;
			return a;
		}
		
		public function get language():Object {
			var a:Object = new Object();
			a.userSelectionEnabled = ((_config.language.@userSelectionEnabled).toUpperCase() == "TRUE") ? true : false;
			return a
		}
		
		public function get shortcutKeys():Object {
			var a:Object = new Object();
			a.showButton = ((_config.shortcutKeys.@showButton).toUpperCase() == "TRUE") ? true : false;
			return a
		}
		
		public function get skinning():Object {
			var a:Object = new Object();
			a.enabled = ((_config.skinning.@enabled).toUpperCase() == "TRUE") ? true : false;
			a.url = _config.skinning.@url;
			return a
		}
		
		public function get layout():XML {
			return new XML(_config.layout.toXMLString());
		}
		
		public function isModulePresent(name:String):Boolean {
			var mn:XMLList = _config.modules..@name;
			var found:Boolean = false;
			for each (var n:XML in mn) {
				if (n.toString().toUpperCase() == name.toUpperCase()) {
					found = true;
					break;
				}
			}
			return found;
		}
		
		public function getConfigFor(moduleName:String):XML {
			if (isModulePresent(moduleName)) {
				return new XML(_config.modules.module.(@name.toUpperCase() == moduleName.toUpperCase()).toXMLString());
			}
			return null;
		}
	}
}
