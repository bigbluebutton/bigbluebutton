package org.bigbluebutton.air.screenshare.services {
	
	public class ScreenshareMessageSender {
		
		private var conn:IScreenshareConnection;
		
		public function ScreenshareMessageSender(conn:IScreenshareConnection) {
			this.conn = conn;
		}
		
		public function checkIfPresenterIsSharingScreen(meetingId:String):void {
			//trace("SCREENSHARE: check if presenter is sharing screen");
			conn.isScreenSharing(meetingId);
		}
	
	}
}
