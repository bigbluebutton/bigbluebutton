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
package org.bigbluebutton.main.model.modules
{
	import flash.events.Event;
	import flash.events.ProgressEvent;
	import flash.system.ApplicationDomain;
	
	import mx.collections.ArrayCollection;
	import mx.events.ModuleEvent;
	import mx.modules.ModuleLoader;
	import mx.utils.StringUtil;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.model.LiveMeeting;

	public class ModuleDescriptor
	{
		private static const LOGGER:ILogger = getClassLogger(ModuleDescriptor);      

		private var _attributes:Object;
		private var _loader:ModuleLoader;
		private var _module:IBigBlueButtonModule;
		private var _loaded:Boolean = false;
		private var _connected:Boolean = false;
				
		private var callbackHandler:Function;
		private var applicationDomain:ApplicationDomain;
		
		public var unresolvedDependancies:ArrayCollection;
		public var resolved:Boolean = false;
		
		public function ModuleDescriptor(attributes:XML)
		{
			unresolvedDependancies = new ArrayCollection();
			_attributes = new Object();
			_loader = new ModuleLoader();
			
			parseAttributes(attributes);			
		}
		
		public function setApplicationDomain(appDomain:ApplicationDomain):void{
			this.applicationDomain = appDomain;
		}

		public function addAttribute(attribute:String, value:Object):void {
			_attributes[attribute] = value;
		}
		
		public function getName():String{
			return _attributes["name"] as String;
		}
		
		public function getAttribute(name:String):Object {
			return _attributes[name];
		}
		
		public function get attributes():Object {
			return _attributes;
		}
		
		public function get module():IBigBlueButtonModule {
			return _module;
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function get loader():ModuleLoader{
			return _loader;
		}
		
		private function parseAttributes(item:XML):void {
			var attNamesList:XMLList = item.@*;

			for (var i:int = 0; i < attNamesList.length(); i++)
			{ 
			    var attName:String = attNamesList[i].name();
			    var attValue:String = item.attribute(attName);
			    _attributes[attName] = attValue;
			}
			
			populateDependancies();
		}
		
		
		public function load(resultHandler:Function):void {
			if (this.applicationDomain == null) throw new Error("Common application domain not set for module. Make sure your module has the common BigBlueButton Application Domain");
			
			_loader.applicationDomain = this.applicationDomain;
			callbackHandler = resultHandler;
			_loader.addEventListener("loading", onLoading);
			_loader.addEventListener("progress", onLoadProgress);
			_loader.addEventListener("ready", onReady);
			_loader.addEventListener("error", onErrorLoading);
			_loader.url = _attributes.url;
			_loader.loadModule();
		}

		private function onReady(event:Event):void {
			var modLoader:ModuleLoader = event.target as ModuleLoader;
			if (!(modLoader.child is IBigBlueButtonModule)) throw new Error(getName() + " is not a valid BigBlueButton module");
			_module = modLoader.child as IBigBlueButtonModule;
			if (_module != null) {
				_loaded = true;
				callbackHandler(ModuleManager.MODULE_LOAD_READY, _attributes.name);
			} 
		}	

		private function onLoadProgress(e:ProgressEvent):void {
			callbackHandler(ModuleManager.MODULE_LOAD_PROGRESS, 
			_attributes.name, Math.round((e.bytesLoaded/e.bytesTotal) * 100));
		}	
		
		private function onErrorLoading(e:ModuleEvent):void{
			var logData:Object = UsersUtil.initLogData();
			logData.module = getName();
			logData.tags = ["loading"];
			logData.error = e.errorText;
			logData.logCode = "error_loading_module";
			LOGGER.error(JSON.stringify(logData));
		}
		
		private function onLoading(e:Event):void{
//			LogUtil.debug(getName() + " is loading");
		}
		
		public function useProtocol(protocol:String):void {
			if (_attributes.uri == null) return;
			
			_attributes.uri = _attributes.uri.replace(/rtmp:/gi, protocol + ":");
		}
		
		public function removeDependancy(module:String):void{
			for (var i:int = 0; i<unresolvedDependancies.length; i++){
				if (unresolvedDependancies[i] == module) unresolvedDependancies.removeItemAt(i);
			}
		}
		
		private function populateDependancies():void{
			var dependString:String = _attributes["dependsOn"] as String;
			if (dependString == null) return;
			
			var trimmedString:String = StringUtil.trimArrayElements(dependString, ",");
			var dependancies:Array = trimmedString.split(",");
			
			for (var i:int = 0; i<dependancies.length; i++){
				unresolvedDependancies.addItem(dependancies[i]);
			}
		}
		
		public function loadConfigAttributes(protocol:String):void{
      var intMeetingId: String = LiveMeeting.inst().meeting.internalId;
      var userName: String = LiveMeeting.inst().me.name;
      var role: String = LiveMeeting.inst().me.role;
      var intUserId: String = LiveMeeting.inst().me.id;
      var voiceConf: String = LiveMeeting.inst().meeting.voiceConf;
      var welcome: String = LiveMeeting.inst().me.welcome;
      var extUserId: String = LiveMeeting.inst().me.externalId;
 
			addAttribute("conference", intMeetingId);
			addAttribute("username", userName);
			addAttribute("userrole", role);
			addAttribute("room", intMeetingId);
			addAttribute("userid", intUserId);
			addAttribute("voicebridge", voiceConf);
			addAttribute("webvoiceconf", voiceConf);
			addAttribute("welcome", welcome);
			addAttribute("externUserID", extUserId);
			addAttribute("internalUserID", intUserId);
			addAttribute("meetingID", intMeetingId);
			addAttribute("protocol", protocol);
			useProtocol(protocol);
		}
	}
}
