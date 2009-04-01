package org.bigbluebutton.modules.listeners.model
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.listeners.ListenersModuleConstants;
	import org.bigbluebutton.modules.listeners.model.service.IListenersService;
	import org.bigbluebutton.modules.listeners.model.service.ListenersSOService;
	import org.bigbluebutton.modules.listeners.model.vo.IListeners;
	import org.bigbluebutton.modules.listeners.model.vo.Listeners;
	import org.bigbluebutton.modules.listeners.model.service.RecordingService;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ListenersProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ListenersProxy";
		
		private var recordingService:RecordingService;
		
		private var _module:ListenersModule;		
		private var _listenersService:IListenersService;
		private var _listeners:IListeners = null;
		// Is teh disconnection due to user issuing the disconnect or is it the server
		// disconnecting due to t fault?
		private var manualDisconnect:Boolean = false;
		
		public function ListenersProxy(module:ListenersModule)
		{
			super(NAME);
			_module = module;
			recordingService = new RecordingService(_module);
			connect();
		}
		
		override public function getProxyName():String
		{
			return NAME;
		}
		
		public function connect():void {
			_listeners = new Listeners();
			_listenersService = new ListenersSOService(_listeners, _module);
			_listenersService.addConnectionStatusListener(connectionStatusListener);
			_listenersService.addMessageSender(messageSender);	
			recordingService.addMessageSender(messageSender);
			manualDisconnect = false;
			_listenersService.connect(_module.uri);		
		}
		
		public function stop():void {
			// USer is issuing a disconnect.
			manualDisconnect = true;
			_listenersService.disconnect();
		}
		
		public function isModerator():Boolean {
			return (_module as ListenersModule).isModerator();
		}
		
		public function get listeners():ArrayCollection {
			return _listeners.listeners;
		}
		
		public function convertRecodingToMp3():void {
			recordingService.convertRecordedAudioToMP3();
		}
		
		private function connectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (connected) {
			//	sendNotification(ListenersModuleConstants.CONNECTED);
			} else {
				_listeners = null;
				sendNotification(ListenersModuleConstants.DISCONNECTED, {manual:manualDisconnect, errors:errors});
			}
		}

		public function muteUnmuteUser(userid:Number, mute:Boolean):void
		{
			_listenersService.muteUnmuteUser(userid, mute);		
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
			sendNotification(msg, body);
		}		
	}
}