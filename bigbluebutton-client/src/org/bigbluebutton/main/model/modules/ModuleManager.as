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
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.system.ApplicationDomain;
	import flash.utils.Dictionary;
	import mx.collections.ArrayCollection;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.events.AppVersionEvent;
	
	public class ModuleManager
	{
		private static const LOGGER:ILogger = getClassLogger(ModuleManager);      
    
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		
		private var _initializedListeners:ArrayCollection = new ArrayCollection();
			
		private var sorted:ArrayCollection; //The array of modules sorted by dependencies, with least dependent first
		
		private var _applicationDomain:ApplicationDomain;
		
		private var modulesDispatcher:ModulesDispatcher;
		
		
		
		public function ModuleManager(modulesDispatcher: ModulesDispatcher)
		{
      this.modulesDispatcher = modulesDispatcher;
			_applicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);
		}
				
		public function configLoaded():void{	
			var modules:Dictionary = BBB.getConfigManager().getModules();	
			for (var key:Object in modules) {
				var m:ModuleDescriptor = modules[key] as ModuleDescriptor;
				m.setApplicationDomain(_applicationDomain);
			}
			
			var resolver:DependancyResolver = new DependancyResolver();
			sorted = resolver.buildDependencyTree(modules);
			
			BBB.initConnectionManager().initPortTestOption();

			modulesDispatcher.sendPortTestEvent();
		}
		
		public function loadConfig():void {
			BBB.getConfigManager();
			BBB.loadConfig();
		}

		private function getModule(name:String):ModuleDescriptor {
			return BBB.getConfigManager().getModuleFor(name);	
		}

		private function startModule(name:String):void {
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				var protocol:String = "rtmp";
				if (BBB.initConnectionManager().isTunnelling) {
					protocol = "rtmpt";
				}
				m.loadConfigAttributes(protocol);
				bbb.start(m.attributes);
			}
		}

		private function stopModule(name:String):void {
      
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				if(bbb == null) { //Still has null object reference on logout sometimes.
					return;
				}
				bbb.stop();
			}	
		}
						
		public function loadModule(name:String):void {
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				if (!m.loaded) {
					m.load(loadModuleResultHandler);
				}
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
						modulesDispatcher.sendModuleLoadReadyEvent(name)	
					break;				
				}
			} 
			
			if (allModulesLoaded()) {
				sendAppAndLocaleVersions();
			}
		}
		
		private function sendAppAndLocaleVersions():void {
			var dispatcher:Dispatcher = new Dispatcher();
			var versionEvent:AppVersionEvent = new AppVersionEvent();
			versionEvent.appVersion = BBB.getConfigManager().config.version;	
			versionEvent.localeVersion = BBB.getConfigManager().config.locale.version; 
			versionEvent.configLocaleVersion = true;
			versionEvent.suppressLocaleWarning = BBB.getConfigManager().config.locale.suppressLocaleWarning;
			dispatcher.dispatchEvent(versionEvent);			
		}
		
		public function moduleStarted(name:String, started:Boolean):void {			
			var m:ModuleDescriptor = getModule(name);
		}
		
		public function startUserServices():void {
			modulesDispatcher.sendStartUserServicesEvent();
		}
		
		public function loadAllModules():void{
			modulesDispatcher.sendModuleLoadingStartedEvent();
			
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
				loadModule(m.getName());
			}
		}
		
		public function startLayoutModule():void{
			for (var i:int = 0; i<sorted.length; i++){
				var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
        if (m.getName() == "LayoutModule") {
          startModule(m.getName());
        }				
			}
		}

    public function startAllModules():void{
      for (var i:int = 0; i<sorted.length; i++){
        var m:ModuleDescriptor = sorted.getItemAt(i) as ModuleDescriptor;
        if (m.getName() != "LayoutModule") {
          startModule(m.getName());
        }
      }
      modulesDispatcher.sendAllModulesLoadedEvent();
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
					return false;
				} 
			}
			return true;
		}

	}
}
