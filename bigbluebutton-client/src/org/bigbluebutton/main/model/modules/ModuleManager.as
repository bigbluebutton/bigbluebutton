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
package org.bigbluebutton.main.model.modules
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.system.ApplicationDomain;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.main.events.ModuleLoadEvent;
	import org.bigbluebutton.main.events.UserServicesEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.ConfigParameters;
	
	public class ModuleManager
	{
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		
		private var _initializedListeners:ArrayCollection = new ArrayCollection();
			
		private var sorted:ArrayCollection; //The array of modules sorted by dependencies, with least dependent first
		
		private var _applicationDomain:ApplicationDomain;
		private var configParameters:ConfigParameters;
		private var conferenceParameters:ConferenceParameters;
		
		private var _protocol:String;
		
		private var modulesDispatcher:ModulesDispatcher;
		
		public function ModuleManager()
		{
			_applicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);	
			modulesDispatcher = new ModulesDispatcher();
			configParameters = new ConfigParameters(handleComplete);
		}
				
		private function handleComplete():void{	
			var modules:Dictionary = configParameters.getModules();
			modulesDispatcher.sendPortTestEvent();
			
			for (var key:Object in modules) {
				var m:ModuleDescriptor = modules[key] as ModuleDescriptor;
				m.setApplicationDomain(_applicationDomain);
			}
			
			var resolver:DependancyResolver = new DependancyResolver();
			sorted = resolver.buildDependencyTree(modules);
		}
		
		public function useProtocol(protocol:String):void {
			_protocol = protocol;
		}
		
		public function get portTestHost():String {
			return configParameters.portTestHost;
		}
		
		public function get portTestApplication():String {
			return configParameters.portTestApplication;
		}
		
		private function getModule(name:String):ModuleDescriptor {
			return configParameters.getModule(name);	
		}

		private function startModule(name:String):void {
			LogUtil.debug('Request to start module ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Starting ' + name);
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				m.loadConfigAttributes(conferenceParameters, _protocol);
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
						modulesDispatcher.sendLoadProgressEvent(name, progress);
					break;	
					case MODULE_LOAD_READY:
						LogUtil.debug('Module ' + name + " has been loaded.");		
						modulesDispatcher.sendModuleLoadReadyEvent(name)	
					break;				
				}
			} else {
				LogUtil.debug(name + " not found.");
			}
			
			if (allModulesLoaded()) {
				startAllModules();
				modulesDispatcher.sendAllModulesLoadedEvent();	
			}
		}
		
		public function moduleStarted(name:String, started:Boolean):void {			
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Setting ' + name + ' started to ' + started);
			}	
		}
		
		public function startUserServices():void {
			modulesDispatcher.sendStartUserServicesEvent(configParameters.application, configParameters.host);
		}
		
		public function loadAllModules(parameters:ConferenceParameters):void{
			modulesDispatcher.sendModuleLoadingStartedEvent(configParameters.getModulesXML());
			conferenceParameters = parameters;
			Role.setRole(parameters.role);
			
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				loadModule(m.getName());
			}
		}
		
		public function startAllModules():void{
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				startModule(m.getName());
			}
		}
		
		public function handleLogout():void {
			for (var i:int = 0; i <sorted.length; i++) {				
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				stopModule(m.getName());
			}
		}
		
		private function allModulesLoaded():Boolean{
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				if (!m.loaded){
					LogUtil.debug("Module " + m.getName() + " has not yet been loaded");
					return false;
				} 
			}
			return true;
		}

	}
}
