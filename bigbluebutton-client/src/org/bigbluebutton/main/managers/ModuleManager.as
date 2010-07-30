/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.main.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.main.events.ModuleLoadEvent;
	import org.bigbluebutton.main.events.UserServicesEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.ModuleDescriptor;
	
	public class ModuleManager
	{
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		
		public static const FILE_PATH:String = "conf/config.xml";
		private var _urlLoader:URLLoader;
		private var _initializedListeners:ArrayCollection = new ArrayCollection();
		//private var _moduleLoadedListeners:ArrayCollection = new ArrayCollection();
		
		private var _numModules:int = 0;		
		private var  _modules:Dictionary = new Dictionary();
		private var sorted:ArrayCollection; //The array of modules sorted by dependencies, with least dependent first
		
		private var _parameters:ConferenceParameters;
		private var _version:String;
		private var _localeVersion:String;
		private var _protocol:String;
		private var _portTestHost:String;
		private var _portTestApplication:String;
		private var _helpURL:String;
		private var _application:String;
		private var _host:String;
		
		private var globalDispatcher:Dispatcher;
		
		public function ModuleManager()
		{
			_urlLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);	
			globalDispatcher = new Dispatcher();
		}
		
		public function initialize():void {
			// Add a random string on the query so that we always get an up-to-date config.xml
			var date:Date = new Date();
			loadXmlFile(_urlLoader, FILE_PATH + "?a=" + date.time);
		}
		
		public function addInitializedListener(initializedListener:Function):void {
			_initializedListeners.addItem(initializedListener);
		}
		
		/*public function addModuleLoadedListener(loadListener:Function):void {
			_moduleLoadedListeners.addItem(loadListener);
		}*/
		
		public function loadXmlFile(loader:URLLoader, file:String):void {
			loader.load(new URLRequest(file));
		}
				
		private function handleComplete(e:Event):void{
			parse(new XML(e.target.data));	
			if (_numModules > 0) {
				notifyInitializedListeners(true);
			} else {
				notifyInitializedListeners(false);
			}		
			
			buildDependencyTree();
		}
		
		private function notifyInitializedListeners(inited:Boolean):void {
			for (var i:int=0; i<_initializedListeners.length; i++) {
				var listener:Function = _initializedListeners.getItemAt(i) as Function;
				listener(inited);
			}
		}
				
		public function parse(xml:XML):void{
			_portTestHost = xml.porttest.@host;
			_portTestApplication = xml.porttest.@application;
			_application = xml.application.@uri;
			_host = xml.application.@host;
			
			_helpURL = xml.help.@url;
						
			var list:XMLList = xml.modules.module;
			_version = xml.version;
			_localeVersion = xml.localeversion;

			var item:XML;
						
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				_modules[item.@name] = mod;
				_numModules++;
			}					
		}
		
		public function useProtocol(protocol:String):void {
			_protocol = protocol;
		}
		
		public function get portTestHost():String {
			return _portTestHost;
		}
		
		public function get portTestApplication():String {
			return _portTestApplication;
		}
				
		public function get numberOfModules():int {
			return _numModules;
		}
		
		public function hasModule(name:String):Boolean {
			var m:ModuleDescriptor = getModule(name);
			if (m != null) return true;
			return false;
		}
		
		private function getModule(name:String):ModuleDescriptor {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getAttribute("name") == name) {
					return m;
				}
			}		
			return null;	
		}

		private function startModule(name:String):void {
			LogUtil.debug('Request to start module ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Starting ' + name);
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				if (_parameters != null) {
					LogUtil.debug("LOADING_ATTRIBUTES");
					m.addAttribute("conference", _parameters.conference);
					m.addAttribute("username", _parameters.username);
					m.addAttribute("userrole", _parameters.role);
					m.addAttribute("room", _parameters.room);
					m.addAttribute("authToken", _parameters.authToken);
					m.addAttribute("userid", _parameters.userid);
					m.addAttribute("mode", _parameters.mode);
					m.addAttribute("connection", _parameters.connection);
					m.addAttribute("voicebridge", _parameters.voicebridge);
					m.addAttribute("webvoiceconf", _parameters.webvoiceconf);
					m.addAttribute("welcome", _parameters.welcome);
					m.addAttribute("meetingID", _parameters.meetingID);
					m.addAttribute("externUserID", _parameters.externUserID);
					
				} else {
					// Pass the mode that we got from the URL query string.
					m.addAttribute("mode", "LIVE");
				}	
				m.addAttribute("protocol", _protocol);
				m.useProtocol(_protocol);				
				bbb.start(m.attributes);		
			}	
		}

		private function stopModule(name:String):void {
			LogUtil.debug('Request to stop module ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Stopping ' + name);
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				if(bbb == null) { //Still has null object refrence on logout sometimes.
					LogUtil.debug('Module ' + name + ' was null skipping');
					return;
				}
				bbb.stop();
			}	
		}
						
		public function loadModule(name:String):void {
			LogUtil.debug('BBBManager Loading ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				if (m.loaded) {
					//loadModuleResultHandler(MODULE_LOAD_READY, name);
				} else {
					LogUtil.debug('Found module ' + m.attributes.name);
					m.load(loadModuleResultHandler);
				}
			} else {
				LogUtil.debug(name + " not found.");
			}
		}
				
		private function loadModuleResultHandler(event:String, name:String, progress:Number=0):void {
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				switch(event) {
					case MODULE_LOAD_PROGRESS:
						var loadEvent:ModuleLoadEvent = new ModuleLoadEvent(ModuleLoadEvent.MODULE_LOAD_PROGRESS);
						loadEvent.moduleName = name;
						loadEvent.progress = progress;
						globalDispatcher.dispatchEvent(loadEvent);
					break;	
					case MODULE_LOAD_READY:
						LogUtil.debug('Module ' + m.attributes.name + " has been loaded.");		
						
						var loadReadyEvent:ModuleLoadEvent = new ModuleLoadEvent(ModuleLoadEvent.MODULE_LOAD_READY);
						loadReadyEvent.moduleName = name;
						globalDispatcher.dispatchEvent(loadReadyEvent);				
					break;				
				}
			} else {
				LogUtil.debug(name + " not found.");
			}
			
			if (allModulesLoaded()) {
				startAllModules();
				globalDispatcher.dispatchEvent(new ModuleLoadEvent(ModuleLoadEvent.ALL_MODULES_LOADED));		
			}
		}
		
		public function moduleStarted(name:String, started:Boolean):void {			
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Setting ' + name + ' started to ' + started);
				m.started = started;
			}	
		}
				
		public function get modules():Dictionary {
			return _modules;
		}
		
		public function getAppVersion():String {
			return _version;
		}
		
		public function getLocaleVersion():String {
			return _localeVersion;
		}
		
		public function getNumberOfModules():int {
			return _numModules;
		}
		
		public function startUserServices():void {
			var e:UserServicesEvent = new UserServicesEvent(UserServicesEvent.START_USER_SERVICES);
			e.applicationURI = _application;
			e.hostURI = _host;
			globalDispatcher.dispatchEvent(e);
		}
		
		public function loadAllModules(parameters:ConferenceParameters):void{
			_parameters = parameters;
			Role.setRole(parameters.role);
			
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				loadModule(m.getAttribute("name") as String);
			}
		}
		
		public function startAllModules():void{
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				startModule(m.getAttribute("name") as String);
			}
		}
		
		public function handleLogout():void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				stopModule(m.getAttribute("name") as String);
			}
		}
		
		/**
		 * Creates a dependency tree for modules using a topological sort algorithm (Khan, 1962, http://portal.acm.org/beta/citation.cfm?doid=368996.369025)
		 */
		private function buildDependencyTree():void{
			sorted = new ArrayCollection();
			var independent:ArrayCollection = getModulesWithNoDependencies();
			
			while(independent.length > 0){
				var n:ModuleDescriptor = independent.removeItemAt(0) as ModuleDescriptor;
				sorted.addItem(n);
				n.resolved = true;
				
				for (var key:Object in _modules) {
					var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
					m.removeDependency(n.getAttribute("name") as String);
					if ((m.unresolvedDependencies.length == 0) && (!m.resolved)){
						independent.addItem(m);
						m.resolved = true;
					}
				}
			}
			
			//Debug Information
			for (var key2:Object in _modules) {
				var m2:ModuleDescriptor = _modules[key2] as ModuleDescriptor;
				if (m2.unresolvedDependencies.length != 0){
					LogUtil.error("Module " + (m2.getAttribute("name") as String) + " still has a dependency " + (m2.unresolvedDependencies.getItemAt(0) as String)); 
				}
			}
			LogUtil.debug("Dependency Order: ");
			for (var u:int = 0; u<sorted.length; u++){
				LogUtil.debug(((sorted.getItemAt(u) as ModuleDescriptor).getAttribute("name") as String));
			}
		}
		
		private function getModulesWithNoDependencies():ArrayCollection{
			var returnArray:ArrayCollection = new ArrayCollection();
			for (var key:Object in _modules) {
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.unresolvedDependencies.length == 0) {
					returnArray.addItem(m);
				}
			}
			return returnArray;
		}
		
		private function allModulesLoaded():Boolean{
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				if (!m.loaded){
					LogUtil.debug("Module " + (m.getAttribute("name") as String) + " has not yet been loaded");
					return false;
				} 
			}
			return true;
		}

	}
}
