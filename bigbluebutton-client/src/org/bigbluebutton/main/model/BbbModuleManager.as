package org.bigbluebutton.main.model
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	
	public class BbbModuleManager
	{
		public static const FILE_PATH:String = "conf/modules.xml";
		private var _urlLoader:URLLoader;
		private var _initializedListeners:ArrayCollection = new ArrayCollection();
		private var _moduleLoadedListeners:ArrayCollection = new ArrayCollection();
		
		private var _numModules:int = 0;		
		public var  _modules:Dictionary = new Dictionary();
		private var _user:Object;
		
		public function BbbModuleManager()
		{
			_urlLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);			
		}
		
		public function initialize():void {
			loadXmlFile(_urlLoader, FILE_PATH);
		}
		
		public function addInitializedListener(initializedListener:Function):void {
			_initializedListeners.addItem(initializedListener);
		}
		
		public function addModuleLoadedListener(loadListener:Function):void {
			_moduleLoadedListeners.addItem(loadListener);
		}
		
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
		}
		
		private function notifyInitializedListeners(inited:Boolean):void {
			for (var i:int=0; i<_initializedListeners.length; i++) {
				var listener:Function = _initializedListeners.getItemAt(i) as Function;
				listener(inited);
			}
		}

		private function notifyModuleLoadedListeners(event:String, name:String, progress:Number=0):void {
			for (var i:int=0; i<_moduleLoadedListeners.length; i++) {
				var listener:Function = _moduleLoadedListeners.getItemAt(i) as Function;
				listener(event, name, progress);
			}
		}
				
		public function parse(xml:XML):void{
			var list:XMLList = xml.module;
			var item:XML;
						
			for each(item in list){
				var attributes:Object = parseAttributes(item);
				var mod:ModuleDescriptor = new ModuleDescriptor(attributes);
				_modules[item.@name] = mod;
				_numModules++;
				//LogUtil.debug("NAME!!!!!!!!!!!!!!!! " + item.@name);
			}					
		}
		
		public function parseAttributes(item:XML):Object {
			var atts:Object = new Object();
			var attNamesList:XMLList = item.@*;

			for (var i:int = 0; i < attNamesList.length(); i++)
			{ 
			    var attName:String = attNamesList[i].name();
			    var attValue:String = item.attribute(attName);
			    atts[attName] = attValue;
			} 
			return atts;
		}
		
		public function loggedInUser(user:Object):void {
			LogUtil.debug('loggedin user ' + user.username);
			_user = new Object();
			_user.userid = user.userid;
			_user.username = user.username;
			_user.userrole = user.userrole;
			_user.room = user.room;
			_user.authToken = user.authToken;
		}
		
		public function addUserIntoAttributes(user:Object):void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				m.attributes.userid = user.userid;
				m.attributes.username = user.name;
				m.attributes.userrole = user.role;
				m.attributes.room = user.room;
				m.attributes.authToken = user.authToken;	
			}				
		}
		
		
		public function get numberOfModules():int {
			return _numModules;
		}
		
		public function getModule(name:String):ModuleDescriptor {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.attributes.name == name) {
					return m;
				}
			}		
			return null;	
		}

		/*public function loadModules():void {
			LogUtil.debug('Loading all modules');
			for (var key:Object in _modules) {
				LogUtil.debug("["+ key + "," + _modules[key].attributes.url + "]");
				loadModule(key as String);
			}
		}*/
		
		public function startModules(router:Router):void {
			LogUtil.debug('Starting all modules');
			for (var key:Object in _modules) {
				LogUtil.debug('Starting ' + _modules[key].name);
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				if (m.attributes.name == 'ViewersModule') {
					bbb.acceptRouter(router);	
				}
			}		
		}

		public function startModule(name:String, router:Router):void {
			LogUtil.debug('Request to start module ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Starting ' + name);
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				bbb.acceptRouter(router);
				if (_user != null) {
					m.attributes.userid = _user.userid;
					m.attributes.username = _user.username;
					m.attributes.userrole = _user.userrole;
					m.attributes.room = _user.room;
					m.attributes.authToken = _user.authToken;
					LogUtil.debug(m.attributes.username + " _user.username=" + _user.username);
				}		
				
				bbb.start(m.attributes);		
			}	
		}

		public function stopModule(name:String):void {
			LogUtil.debug('Request to stop module ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				LogUtil.debug('Stopping ' + name);
				var bbb:IBigBlueButtonModule = m.module as IBigBlueButtonModule;
				bbb.stop();		
			}	
		}
						
		public function loadModule(name:String):void {
			LogUtil.debug('BBBManager Loading ' + name);
			var m:ModuleDescriptor = getModule(name);
			if (m != null) {
				if (m.loaded) {
					loadModuleResultHandler(MainApplicationConstants.MODULE_LOAD_READY, name);
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
					case MainApplicationConstants.MODULE_LOAD_PROGRESS:
						notifyModuleLoadedListeners(MainApplicationConstants.MODULE_LOAD_PROGRESS, name, progress);
					break;	
					case MainApplicationConstants.MODULE_LOAD_READY:
						m.loaded = true;
						LogUtil.debug('Loaded module ' + m.attributes.name);		
						notifyModuleLoadedListeners(MainApplicationConstants.MODULE_LOAD_READY, name);					
					break;				
				}
			} else {
				LogUtil.debug(name + " not found.");
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
	}
}