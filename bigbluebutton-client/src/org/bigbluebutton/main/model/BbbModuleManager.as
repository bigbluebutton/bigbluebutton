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
		public static const FILE_PATH:String = "conf/config.xml";
		private var _urlLoader:URLLoader;
		private var _initializedListeners:ArrayCollection = new ArrayCollection();
		private var _moduleLoadedListeners:ArrayCollection = new ArrayCollection();
		
		private var _numModules:int = 0;		
		public var  _modules:Dictionary = new Dictionary();
		private var _user:Object;
		private var _router:Router;
		private var _mode:String;
		private var _version:String;
		private var _protocol:String;
		private var _portTestHost:String;
		private var _portTestApplication:String;
		
		public function BbbModuleManager(router:Router, mode:String)
		{
			_router = router;
			_mode = mode;
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
			_portTestHost = xml.porttest.@host;
			_portTestApplication = xml.porttest.@application;
			
			var list:XMLList = xml.modules.module;
			_version = xml.version;
			
			trace("version " + _version);
			
			var item:XML;
						
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				_modules[item.@name] = mod;
				_numModules++;
				//LogUtil.debug("NAME!!!!!!!!!!!!!!!! " + item.@name);
			}					
		}
		
		public function useProtocol(protocol:String):void {
			_protocol = protocol;
		}
		
		public function loggedInUser(user:Object):void {
			LogUtil.debug('loggedin user ' + user.username);
			_user = new Object();
			_user.conference = user.conference;
			_user.username = user.username;
			_user.userrole = user.userrole;
			_user.room = user.room;
			_user.authToken = user.authToken;
			_user.userid = user.userid;
			_user.mode = user.mode;
			_user.voicebridge = user.voicebridge;
			_user.connection = user.connection;
			_user.playbackRoom = user.playbackRoom;
			_user.record = user.record;
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
				bbb.acceptRouter(_router);
				if (_user != null) {
					m.addAttribute("conference", _user.conference);
					m.addAttribute("username", _user.username);
					m.addAttribute("userrole", _user.userrole);
					m.addAttribute("room", _user.room);
					m.addAttribute("authToken", _user.authToken);
					m.addAttribute("userid", _user.userid);
					m.addAttribute("mode", _user.mode);
					m.addAttribute("connection", _user.connection);
					m.addAttribute("voicebridge", _user.voicebridge);
					m.addAttribute("playbackRoom", _user.playbackRoom);
					m.addAttribute("record", _user.record);
					
				} else {
					// Pass the mode that we got from the URL query string.
					m.addAttribute("mode", _mode);
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
						LogUtil.debug('Module ' + m.attributes.name + " has been loaded.");		
						notifyModuleLoadedListeners(MainApplicationConstants.MODULE_LOAD_READY, name);
						loadNextModule(name);					
					break;				
				}
			} else {
				LogUtil.debug(name + " not found.");
			}
		}
		
		private function loadNextModule(curModule:String):void {
			var m:ModuleDescriptor = getModule(curModule);
			if (m != null) {
				var nextModule:String = m.getAttribute("loadNextModule") as String;
				if (nextModule != null) {
					LogUtil.debug("Loading " + nextModule + " next.");
					loadModule(nextModule);
				} else {
					LogUtil.debug("All modules have been loaded - " + m.getAttribute("name") as String);
					notifyModuleLoadedListeners(MainApplicationConstants.ALL_MODULES_LOADED, null);
				}
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
		
		public function getNumberOfModules():int {
			return _numModules;
		}
		
		public function handleAppModelInitialized():void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getAttribute("onAppInitEvent") != null) {
					loadModule(m.getAttribute("name") as String);
				}
			}
		}
		
		public function handleAppStart():void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getAttribute("onAppStartEvent") != null) {
					startModule(m.getAttribute("name") as String);
				}
			}
		}
		
		public function handleUserLoggedIn():void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getAttribute("onUserLoggedInEvent") != null) {
					startModule(m.getAttribute("name") as String);
				}
			}
		}
		
		public function handleUserJoined():void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getAttribute("onUserJoinedEvent") != null) {
					startModule(m.getAttribute("name") as String);
				}
			}
		}
		
		public function handleLogout():void {
			for (var key:Object in _modules) {				
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.getAttribute("onUserLogoutEvent") != null) {
					stopModule(m.getAttribute("name") as String);
				}
			}
		}
	}
}