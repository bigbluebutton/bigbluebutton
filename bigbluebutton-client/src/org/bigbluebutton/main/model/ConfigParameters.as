package org.bigbluebutton.main.model
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
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
		
		private var loadedListener:Function;
		
		public function ConfigParameters(loadedListener:Function, file:String = FILE_PATH)
		{
			this.loadedListener = loadedListener;
			_urlLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
			_urlLoader.load(new URLRequest(file + "?a=" + date.time));
		}
		
		private function handleComplete(e:Event):void{
			parse(new XML(e.target.data));	
			this.loadedListener();
		}
		
		private function parse(xml:XML):void{
			rawXML = xml;
			
			portTestHost = xml.porttest.@host;
			portTestApplication = xml.porttest.@application;
			application = xml.application.@uri;
			host = xml.application.@host;
			helpURL = xml.help.@url;
			version = xml.version;
			localeVersion = xml.localeversion;				
		}
		
		public function getModulesXML():XMLList{
			return rawXML.modules.module;
		}
		
	}
}