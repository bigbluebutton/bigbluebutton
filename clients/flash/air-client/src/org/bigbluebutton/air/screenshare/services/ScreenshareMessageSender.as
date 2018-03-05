package org.bigbluebutton.air.screenshare.services
{

	public class ScreenshareMessageSender
	{

		private var conn:IScreenshareConnection;
		
		public function ScreenshareMessageSender(conn:IScreenshareConnection) {
			this.conn = conn;
		}
		
		public function checkIfPresenterIsSharingScreen(meetingId: String):void {
			trace("check if presenter is sharing screen");
			conn.isScreenSharing(meetingId);
		}
		
		public function requestShareToken(meetingId: String, userId:String, record:Boolean, isTunnelling:Boolean):void {
			conn.requestShareToken(meetingId, userId, record, isTunnelling);
		}
		
		public function sharingStartMessage(meetingId: String, userId:String, session: String):void {
			conn.startShareRequest(meetingId, userId, session);
		}
		
		public function requestStopSharing(meetingId: String, streamId:String):void {
			conn.stopShareRequest(meetingId, streamId);
		}
		
		public function requestPauseSharing(meetingId: String, userId:String, streamId:String):void {
			conn.pauseShareRequest(meetingId, userId, streamId);
		}
		
		public function requestRestartSharing(meetingId: String, userId:String):void {
			conn.restartShareRequest(meetingId, userId);
		}
		
		public function sendClientPongMessage(meetingId: String, session: String, timestamp: Number):void {
			conn.sendClientPongMessage(meetingId, session, timestamp);
		}   
		
	}
}