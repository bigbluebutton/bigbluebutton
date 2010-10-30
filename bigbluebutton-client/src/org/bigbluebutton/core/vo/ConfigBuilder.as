package org.bigbluebutton.core.vo {
	public class ConfigBuilder {
		internal var version:String;
		internal var localeVersion:String;
		internal var portTestHost:String;
		internal var portTestApplication:String;
		internal var helpURL:String;
		internal var application:String;
		internal var host:String;
		internal var numModules:int;
		internal var languageEnabled:Boolean;
		internal var skinning:String = "";
		internal var showDebug:Boolean = false;
		
		public function ConfigBuilder(version:String, localVersion:String){
			this.version = version;
			this.localeVersion = localVersion;
		}
		
		public function withPortTestHost(portTestHost:String):ConfigBuilder {
			this.portTestHost = portTestHost;
			return this;
		}
		
		public function withPortTestApplication(portTestApplication:String):ConfigBuilder {
			this.portTestApplication = portTestApplication;
			return this;
		}

		public function withHelpUrl(helpUrl:String):ConfigBuilder {
			this.helpURL = helpUrl;
			return this;
		}
		
		public function withApplication(application:String):ConfigBuilder {
			this.application = application;
			return this;
		}
		
		public function withHost(host:String):ConfigBuilder {
			this.host = host;
			return this;
		}
		
		public function withNumModule(numModules:int):ConfigBuilder {
			this.numModules = numModules;
			return this;
		}
		
		public function withLanguageEnabled(languageEnabled:Boolean):ConfigBuilder {
			this.languageEnabled = languageEnabled;
			return this;
		}
		
		public function withSkinning(skinning:String):ConfigBuilder {
			this.skinning = skinning;
			return this;
		}
		
		public function withShowDebug(showDebug:Boolean):ConfigBuilder {
			this.showDebug = showDebug;
			return this;
		}
		
   		public function build():Config {
			return new Config(this);
		}		
	}
}