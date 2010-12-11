package org.bigbluebutton.main.model
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.main.events.AppVersionEvent;
	import org.bigbluebutton.main.model.modules.ModuleDescriptor;

	public class ConfigParameters
	{
		public static const FILE_PATH:String = "conf/config.xml";
		
		private var _urlLoader:URLLoader;
		
		private var rawXML:XML;
		
		public var version:String;
		public var localeVersion:String;
		public var portTestHost:String;
		public var portTestApplication:String;
		public var helpURL:String;
		public var application:String;
		public var host:String;
		public var numModules:int;
		public var languageEnabled:Boolean;
		public var skinning:String = "";
		public var showDebug:Boolean = false;
		
		private var loadedListener:Function;
		private var dispatcher:Dispatcher = new Dispatcher();
		
		private var _modules:Dictionary;
		
		public function ConfigParameters(loadedListener:Function, file:String = FILE_PATH)
		{
			this.numModules = 0;
			this.loadedListener = loadedListener;
			_urlLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
			_urlLoader.load(new URLRequest(file + "?a=" + date.time));
		}
		
		private function handleComplete(e:Event):void
		{
			parse(new XML(e.target.data));	
			buildModuleDescriptors();
			this.loadedListener();
		}
		
		private function parse(xml:XML):void
		{
			rawXML = xml;
			
			portTestHost = xml.porttest.@host;
			portTestApplication = xml.porttest.@application;
			application = xml.application.@uri;
			host = xml.application.@host;
			helpURL = xml.help.@url;
			version = xml.version;
			localeVersion = xml.localeversion;	
			if (xml.language.@userSelectionEnabled == "true") languageEnabled = true;
			else languageEnabled = false;
			if (xml.skinning.@enabled == "true") skinning = xml.skinning.@url;

			if (xml.debug.@showDebugWindow == "true") showDebug = true;
		}
		
		public function getModulesXML():XMLList{
			return rawXML.modules.module;
		}
		
		private function buildModuleDescriptors():Dictionary{
			_modules = new Dictionary();
			var list:XMLList = getModulesXML();
			var item:XML;
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				_modules[item.@name] = mod;
				numModules++;
			}
			return _modules;
		}
		
		public function getModules():Dictionary{
			return _modules;
		}
		
		public function getModule(name:String):ModuleDescriptor {
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