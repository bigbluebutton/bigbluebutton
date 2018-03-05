package org.bigbluebutton.air.screenshare.services
{
	import org.bigbluebutton.air.main.models.IConferenceParameters;

	public class ScreenshareService
	{
		[Inject]
		public var conn:IScreenshareConnection;
		
		[Inject]
		public var confParams:IConferenceParameters;
		
		private var _sender:ScreenshareMessageSender;
		private var _receiver:ScreenshareMessageReceiver;
		
		public function ScreenshareService()
		{
			_sender = new ScreenshareMessageSender(conn);
			_receiver = new ScreenshareMessageReceiver();
			conn.connectionSuccessSignal.add(onConnectionSuccess);
		}
		
		private function onConnectionSuccess():void {
			conn.addMessageListener(_receiver);
		}
		
		public function checkIfPresenterIsSharingScreen():void {
			trace("check if presenter is sharing screen");
			_sender.checkIfPresenterIsSharingScreen(confParams.meetingID);
		}
		
		public function requestShareToken():void {
			_sender.requestShareToken(confParams.meetingID, confParams.internalUserID, confParams.record, 
				conn.isTunnelling());
		}
		
		public function sharingStartMessage(session: String):void {
			_sender.sharingStartMessage(confParams.meetingID, confParams.internalUserID, session);
		}
		
		public function requestStopSharing(streamId:String):void {
			_sender.requestStopSharing(confParams.meetingID, streamId);
		}
		
		public function requestPauseSharing(streamId:String):void {
			_sender.requestPauseSharing(confParams.meetingID, confParams.internalUserID, streamId);
		}
		
		public function requestRestartSharing():void {
			_sender.requestRestartSharing(confParams.meetingID, confParams.internalUserID);
		}
		
		public function sendClientPongMessage(session: String, timestamp: Number):void {
			_sender.sendClientPongMessage(confParams.meetingID, session, timestamp);
		} 
	}
}