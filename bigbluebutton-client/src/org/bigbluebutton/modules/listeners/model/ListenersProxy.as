package org.bigbluebutton.modules.listeners.model
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.listeners.ListenersModuleConstants;
	import org.bigbluebutton.modules.listeners.model.service.ListenersSOService;
	import org.bigbluebutton.modules.listeners.model.vo.Listeners;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ListenersProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ListenersProxy";

		private var _module:IBigBlueButtonModule;		
		private var _listenersService:IListenersService;
		private var _listeners:IListeners = null;
		
		public function ListenersProxy(module:IBigBlueButtonModule)
		{
			super(NAME);
			_module = module;
		}
		
		override public function getProxyName():String
		{
			return NAME;
		}
		
		public function connect():void {
			_listeners = new Listeners();
			_listenersService = new ListenersSOService(_listeners);
			_listenersService.addConnectionStatusListener(connectionStatusListener);	
			_listenersService.connect(_module.uri);		
		}
		
		public function stop():void {
			_listenersService.disconnect();
		}
		
		public function get listeners():ArrayCollection {
			return listeners.listeners;
		}
		
		private function connectionStatusListener(connected:Boolean):void {
			if (connected) {
				sendNotification(ListenersModuleConstants.CONNECTED);
			} else {
				_participants = null;
				sendNotification(ListenersModuleConstants.DISCONNECTED);
			}
		}

		public function muteUnmuteUser(userid:Number, mute:Boolean):void
		{
			_listenersService.muteUnmuteUser(userId, mute);		
		}

		public function muteAllUsers(mute:Boolean):void
		{	
			_listenersService.muteAllUsers(mute);			
		}
		
		public function ejectUser(userId:Number):void
		{
			_listenersService.ejectUser(userId);			
		}
				
		private function messageSender(msg:String, body:Object=null):void {

		}		
	}
}