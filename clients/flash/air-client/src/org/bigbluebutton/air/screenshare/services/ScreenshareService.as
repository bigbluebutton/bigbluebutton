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
	}
}