package org.bigbluebutton.main.model
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class ShortcutOptions
	{
		private var users:Boolean = true;
		private var videoDock:Boolean = true;
		private var presentation:Boolean = true;
		private var chat:Boolean = true;
		private var polling:Boolean = true;
		private var webcam:Boolean = true;
		private var deskshare:Boolean = true;
		private var audio:Boolean = true;
		
		public function ShortcutOptions() {
			var vxml:XML;
			
			vxml = BBB.getConfigForModule("UsersModule");
			if (vxml == null) {
				users = false;
			}
			
			vxml = BBB.getConfigForModule("VideodockModule");
			if (vxml == null) {
				videoDock = false;
			}
			
			vxml = BBB.getConfigForModule("PresentModule");
			if (vxml == null) {
				presentation = false;
			}
			
			vxml = BBB.getConfigForModule("ChatModule");
			if (vxml == null) {
				chat = false;
			}
			
			vxml = BBB.getConfigForModule("PollingModule");
			if (vxml == null) {
				polling = false;
			}
			
			vxml = BBB.getConfigForModule("VideoconfModule");
			if (vxml == null) {
				webcam = false;
			}
			
			vxml = BBB.getConfigForModule("DeskShareModule");
			if (vxml == null) {
				deskshare = false;
			}
			
			vxml = BBB.getConfigForModule("PhoneModule");
			if (vxml == null) {
				audio = false;
			}
		}
		
		public function get usersActive():Boolean{return users;}
		public function get videoDockActive():Boolean{return videoDock;}
		public function get presentationActive():Boolean{return presentation;}
		public function get chatActive():Boolean{return chat;}
		public function get pollingActive():Boolean{return polling;}
		public function get webcamActive():Boolean{return webcam;}		
		public function get deskshareActive():Boolean{return deskshare;}
		public function get audioActive():Boolean{return audio;}
		
		public function debugString():String{
			return "USERS: " + users + " VIDEODOCK: " + videoDock + " PRESENTATION: " + presentation + " CHAT: " + chat + " POLLING: " + polling + " WEBCAM: " + webcam + " DESKSHARE: " + deskshare + " AUDIO: " + audio;
		}
	}
}