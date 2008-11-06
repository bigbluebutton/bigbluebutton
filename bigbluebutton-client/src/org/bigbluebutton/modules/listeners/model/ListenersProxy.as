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
			_viewersService.disconnect();
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
		
		private function messageSender(msg:String, body:Object=null):void {
			if (msg == ViewersModuleConstants.ASSIGN_PRESENTER) {
				if (me.userid == body.assignedTo) {
					// I've been assigned as presenter.
					trace('I have become presenter');
					isPresenter = true;
					sendNotification(msg, body);
				} else {
					// Somebody else has become presenter.
					if (isPresenter) {
						trace('Somebody else has become presenter.');
						isPresenter = false;
						sendNotification(ViewersModuleConstants.BECOME_VIEWER);
					}
				}
			} else {
				sendNotification(msg, body);
			}
		}		
	}
}