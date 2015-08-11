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
package org.bigbluebutton.core.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.core.FlexGlobals;
	import mx.utils.URLUtil;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.EventBroadcaster;
	import org.bigbluebutton.core.model.Config;
	import org.bigbluebutton.main.events.MeetingNotFoundEvent;
	
	public class ConfigManager2 extends EventDispatcher {
		private static const LOGGER:ILogger = getClassLogger(ConfigManager2);      
    
        public static const CONFIG_XML:String = "bigbluebutton/api/configXML";
    
		private var _config:Config = null;
				
		public function loadConfig():void {
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
      var localeReqURL:String = buildRequestURL() + "?a=" + date.time;
      LOGGER.debug("::loadConfig [{0}]", [localeReqURL]);
			urlLoader.load(new URLRequest(localeReqURL));			
		}		
		
    private function buildRequestURL():String {
      var swfURL:String = FlexGlobals.topLevelApplication.url;
      var protocol:String = URLUtil.getProtocol(swfURL);
      var serverName:String = URLUtil.getServerNameWithPort(swfURL);        
      return protocol + "://" + serverName + "/" + CONFIG_XML;
    }
    
		private function handleComplete(e:Event):void{
      LOGGER.debug("handleComplete [{0}]", [new XML(e.target.data)]);
      
      var xml:XML = new XML(e.target.data)
      
      if (xml.returncode == "FAILED") {
        
        LOGGER.debug("Getting configXML failed [{0}]", [xml]);        
        var dispatcher:Dispatcher = new Dispatcher();
        dispatcher.dispatchEvent(new MeetingNotFoundEvent(xml.response.logoutURL));
      } else { 
        LOGGER.debug("Getting configXML passed [{0}]", [xml]);
			  _config = new Config(new XML(e.target.data));
			  EventBroadcaster.getInstance().dispatchEvent(new Event("configLoadedEvent", true));	
      }
		}
		
		public function get config():Config {
			return _config;
		}
	}
}