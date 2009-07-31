package org.bigbluebutton.modules.phone.managers
{
	import flash.events.IEventDispatcher;
	
	import org.bigbluebutton.modules.phone.events.CallConnectedEvent;
	
	public class PhoneManager
	{
		private var localDispatcher:IEventDispatcher;
		
		private var connectionManager:ConnectionManager;
		private var streamManager:StreamManager;
		
		private var attributes:Object;
		
		public function PhoneManager(dispatcher:IEventDispatcher)
		{
			localDispatcher = dispatcher;
			connectionManager = new ConnectionManager(dispatcher);
			streamManager = new StreamManager(dispatcher);
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function setupMic():void {
			streamManager.initMicrophone();
		}
		
		public function setupConnection():void {
			streamManager.setConnection(connectionManager.getConnection());
		}
		public function join():void {
			setupMic();
			var uid:String = String( Math.floor( new Date().getTime() ) );
			connectionManager.connect(uid, attributes.username, attributes.room, attributes.uri);
		}
		
		public function register():void {
			setupConnection();
			trace("Registering....");
			connectionManager.register();
		}
		
		public function dialConference():void {
			trace("Dialing...." + attributes.voicebridge);
			connectionManager.doCall(attributes.voicebridge);
		}
		
		public function callConnected(event:CallConnectedEvent):void {
			streamManager.callConnected(event.playStreamName, event.publishStreamName);
		}
		
		public function calledFromGlobal(message:String):void {
			trace("PhoneManager global " + message);
		}
	}
}