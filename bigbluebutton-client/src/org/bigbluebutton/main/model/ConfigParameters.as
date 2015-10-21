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
package org.bigbluebutton.main.model
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.utils.Dictionary;
	
	import mx.core.FlexGlobals;
	import mx.utils.URLUtil;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.main.model.modules.ModuleDescriptor;
	import org.bigbluebutton.util.QueryStringParameters;

	public class ConfigParameters {
		private static const LOGGER:ILogger = getClassLogger(ConfigParameters);
		
		public static const CONFIG_XML:String = "bigbluebutton/api/configXML";
		
		private var _urlLoader:URLLoader;
		
		private var rawXML:XML;
		
		public var version:String;
		public var localeVersion:String;
		public var suppressLocaleWarning:Boolean = false;
		public var portTestHost:String;
		public var portTestApplication:String;
		public var portTestTimeout:Number;
		public var helpURL:String;
		public var application:String;
		public var host:String;
		public var numModules:int;
		public var languageEnabled:Boolean;
		public var shortcutKeysShowButton:Boolean;
		public var skinning:String = "";
		public var showDebug:Boolean = false;
		
		private var loadedListener:Function;
		private var dispatcher:Dispatcher = new Dispatcher();
		
		private var _modules:Dictionary;
		
		public function ConfigParameters(loadedListener:Function, file:String = CONFIG_XML) {			
			this.numModules = 0;
			this.loadedListener = loadedListener;
		}
		
		public function loadConfig():void {
			
			var p:QueryStringParameters = new QueryStringParameters();
			p.collectParameters();
			var sessionToken:String = p.getParameter("sessionToken");
			
			var reqVars:URLVariables = new URLVariables();
			reqVars.sessionToken = sessionToken;
			
			_urlLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
			var localeReqURL:String = buildRequestURL() + "?a=" + date.time;
			
			LOGGER.debug(localeReqURL + " session=[" + sessionToken + "]"); 
			
			var request:URLRequest = new URLRequest(localeReqURL);
			request.method = URLRequestMethod.GET;
			request.data = reqVars;
			
			_urlLoader.load(request);				
		}
		
    private function buildRequestURL():String {
      var swfURL:String = FlexGlobals.topLevelApplication.url;
      var protocol:String = URLUtil.getProtocol(swfURL);
      var serverName:String = URLUtil.getServerNameWithPort(swfURL);        
      return protocol + "://" + serverName + "/" + CONFIG_XML;
    }
    
		private function handleComplete(e:Event):void{
			LOGGER.debug("handleComplete [{0}]", [new XML(e.target.data)]);
			parse(new XML(e.target.data));	
			buildModuleDescriptors();
			this.loadedListener();
		}
		
		private function parse(xml:XML):void{
			rawXML = xml;
			
			portTestHost = xml.porttest.@host;
			portTestApplication = xml.porttest.@application;
			
			portTestTimeout = parseInt(xml.porttest.@timeout);
			if(isNaN(portTestTimeout) || portTestTimeout < 500) portTestTimeout = 10000;
			
			application = xml.application.@uri;
			host = xml.application.@host;
			helpURL = xml.help.@url;
			version = xml.version;
			localeVersion = xml.localeversion;	
			if (xml.localeversion.@suppressWarning == "true") suppressLocaleWarning = true;
			if (xml.language.@userSelectionEnabled == "true") languageEnabled = true;
			else languageEnabled = false;
			
			if (xml.shortcutKeys.@showButton == "true") shortcutKeysShowButton = true;
			else shortcutKeysShowButton = false;
			
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