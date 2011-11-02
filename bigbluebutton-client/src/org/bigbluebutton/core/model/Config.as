package org.bigbluebutton.core.model
{
	import org.bigbluebutton.common.LogUtil;

	public class Config
	{
		private var config:XML = null;
		
		public function Config(config:XML)
		{
			this.config = config;
		}

		public function get help():Object {
			var help:Object = new Object();
			help.url = config.help.@url;
			return help;
		}
			
		public function get locale():Object {
			var v:Object = new Object();
			v.version = config.localeversion;
			return v;
		}
			
		public function get version():String {
			return config.version;
		}
			
		public function get porttest():Object {
			var p:Object = new Object();
			p.host = config.porttest.@host;
			p.application = config.porttest.@application;
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
			
		public function get skinning():Object {
			var a:Object = new Object();
			a.enabled = ((config.skinning.@enabled).toUpperCase() == "TRUE") ? true : false;
			a.url = config.skinning.@url;
			return a
		}
					
		public function get layout():XML {
			return new XML(config.layout.toXMLString());
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
			
		public function getConfigFor(moduleName:String):XML {
			if (isModulePresent(moduleName)) {
					return new XML(config.modules.module.(@name.toUpperCase() == moduleName.toUpperCase()).toXMLString());
			}
			return null;
		}
	}
}