package org.bigbluebutton.modules.classyaudio.managers
{
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.classyaudio.events.CallConnectedEvent;

	public class ClassyAudioManager
	{
		private var connectionManager:ConnectionManager;
		private var streamManager:StreamManager;
		private var onCall:Boolean = false;
		private var attributes:Object;
		
		public function ClassyAudioManager()
		{
			connectionManager = new ConnectionManager();
			streamManager = new StreamManager();
		}
		
		public function setAttributes(attributes:Object):void{
			this.attributes = attributes;
			joinVoice();
		}
		
		public function stopModule():void{
			
		}
		
		public function joinVoice():void {
			//Start listening
			//streamManager.initWithNoMicrophone();
			streamManager.initMicrophone();
			
			var uid:String = String( Math.floor( new Date().getTime() ) );
			connectionManager.connect(uid, attributes.externUserID, attributes.username, attributes.room, attributes.uri);
		}
		
		public function dialConference():void {
			LogUtil.debug("Dialing...." + attributes.webvoiceconf + "...." + attributes.externUserID);
			connectionManager.doCall(attributes.webvoiceconf);
		}
		
		public function callConnected(event:CallConnectedEvent):void {
			LogUtil.debug("Call connected...");
			setupConnection();
			LogUtil.debug("callConnected: Connection Setup");
			streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec);
			LogUtil.debug("callConnected::onCall set");
			onCall = true;
		}
		
		public function hangup():void {
			LogUtil.debug("PhoneManager hangup");
			if (onCall) {
				LogUtil.debug("PM OnCall");
				streamManager.stopStreams();
				connectionManager.doHangUp();
				LogUtil.debug("PM hangup::doHangUp");
				onCall = false;
			}			
		}
		
		private function setupConnection():void {
			streamManager.setConnection(connectionManager.getConnection());
		}
	}
}