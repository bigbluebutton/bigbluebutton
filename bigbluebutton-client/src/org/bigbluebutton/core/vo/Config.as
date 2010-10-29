package org.bigbluebutton.core.vo {
	public class Config {
		private var _version:String;
		private var _localeVersion:String;
		private var _portTestHost:String;
		private var _portTestApplication:String;
		private var _helpURL:String;
		private var _application:String;
		private var _host:String;
		private var _numModules:int;
		private var _languageEnabled:Boolean;
		private var _skinning:String = "";
		private var _showDebug:Boolean = false;
		
		public function Config(builder:ConfigBuilder) {
			_version = builder.version;
			_localeVersion = builder.localeVersion;
			_portTestHost = builder.portTestHost;
			_portTestApplication = builder.portTestApplication;
			_helpURL = builder.helpURL;
			_application = builder.application;
			_host = builder.host;
			_numModules = builder.numModules;
			_languageEnabled = builder.languageEnabled;
			_skinning = builder.skinning;
			_showDebug = builder.showDebug;
		}
		
		public function get version():String {
			return _version;
		}
		
		public function get localeVersion():String {
			return _localeVersion;
		}
		
		public function get portTestHost():String {
			return _portTestHost;
		}
		
		public function get portTestApplication():String {
			return _portTestApplication;
		}
		
		public function get helpURL():String {
			return _helpURL;
		}
		
		public function get application():String {
			return _application;
		}
		
		public function get host():String {
			return _host;
		}
		
		public function get numModules():int {
			return _numModules;
		}
		
		public function get languageEnabled():Boolean {
			return _languageEnabled;
		} 
		
		public function get skinning():String {
			return _skinning;
		}
		
		public function get showDebug():Boolean {
			return _showDebug;
		} 
	}
}