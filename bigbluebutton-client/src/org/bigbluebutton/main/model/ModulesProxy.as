package org.bigbluebutton.main.model
{
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ModulesProxy extends Proxy implements IProxy
	{
		public static const NAME:String = 'ModulesProxy';
		
		private var modulesManager:BbbModuleManager;
		
		private var _user:Object;
		
		public function ModulesProxy(data:Object=null)
		{
			super(NAME, data);
			modulesManager = new BbbModuleManager();
			modulesManager.addInitializedListener(onInitializeComplete);
			modulesManager.addModuleLoadedListener(onModuleLoadedListener);
			modulesManager.initialize();
		}

		private function onInitializeComplete(initialized:Boolean):void {
			if (initialized)
			facade.sendNotification(MainApplicationConstants.APP_MODEL_INITIALIZED);
		}
		
		public function initialize():void {
			modulesManager.initialize();			
		}
		
		public function set user(loggedInUser:Object):void {
			_user = loggedInUser;
			modulesManager.loggedInUser(_user);
			// Add this into the attributes of the module
			//modulesManager.addUserIntoAttributes(_user);
		}

/*		
		public function loadModules():void {
			trace('Loading all modules');
			for (var key:Object in _modules) {
				trace(key, _modules[key].attributes.url);
				loadModule(key, loadModuleResultHandler);
			}
		}
		
		public function startModules(router:Router):void {
			trace('Starting all modules');
			for (var key:Object in _modules) {
				trace('Starting ' + _modules[key].name);
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				if (m.attributes.name == 'ViewersModule') {
					bbb.acceptRouter(router);	
				}
			}		
		}
*/

		public function startModule(name:String, router:Router):void {
			trace('Request to start module ' + name);
			modulesManager.startModule(name, router);
		}

		public function stopModule(name:String):void {
			modulesManager.stopModule(name);
		}
						
		public function loadModule(name:String):void {
			trace('Loading ' + name);
			modulesManager.loadModule(name);
		}
				
		private function onModuleLoadedListener(event:String, name:String, progress:Number=0):void {
			switch(event) {
					case MainApplicationConstants.MODULE_LOAD_PROGRESS:
						facade.sendNotification(MainApplicationConstants.MODULE_LOAD_PROGRESS, {name:name, progress:progress});
					break;	
					case MainApplicationConstants.MODULE_LOAD_READY:
						facade.sendNotification(MainApplicationConstants.MODULE_LOADED, name);					
					break;				
				}
			
		}
		
		public function moduleStarted(name:String, started:Boolean):void {
/*			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m != null) {
					trace('Setting ' + _modules[key].name + ' started to ' + started);
					m.started = started;
				}
			}		
*/		}
				
		public function get modules():Dictionary {
			return null;
//			return _modules;
		}

	}
}