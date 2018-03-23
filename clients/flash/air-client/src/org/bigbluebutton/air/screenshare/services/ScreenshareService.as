package org.bigbluebutton.air.screenshare.services {
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.screenshare.model.IScreenshareModel;
	
	public class ScreenshareService implements IScreenshareService {
		
		[Inject]
		public var conn:IScreenshareConnection;
		
		[Inject]
		public var confParams:IConferenceParameters;
		
		[Inject]
		public var model:IScreenshareModel;
		
		private var _sender:ScreenshareMessageSender;
		
		private var _receiver:ScreenshareMessageReceiver;
		
		public function ScreenshareService() {
		}
		
		public function setupMessageSenderReceiver():void {
			_sender = new ScreenshareMessageSender(conn);
			_receiver = new ScreenshareMessageReceiver(model);
			conn.addMessageListener(_receiver);
			conn.connectionSuccessSignal.add(onConnectionSuccess);
			//trace("SCREENSHARE: setupMessageSenderReceiver");
		}
		
		private function onConnectionSuccess():void {
			checkIfPresenterIsSharingScreen();
		}
		
		public function checkIfPresenterIsSharingScreen():void {
			//trace("SCREENSHARE: check if presenter is sharing screen");
			_sender.checkIfPresenterIsSharingScreen(confParams.meetingID);
		}
		
		public function sendClientPongMessage(session:String, timestamp:Number):void {
		
		}
	}
}
