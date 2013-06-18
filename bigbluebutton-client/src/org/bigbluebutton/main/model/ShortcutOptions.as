package org.bigbluebutton.main.model
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class ShortcutOptions
	{
		private static var users:Boolean = true;
		private static var videoDock:Boolean = true;
		private static var presentation:Boolean = true;
		private static var chat:Boolean = true;
		private static var polling:Boolean = true;
		private static var webcam:Boolean = true;
		private static var deskshare:Boolean = true;
		private static var audio:Boolean = true;
		
		public static function initialize() {
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
		
		public static function get usersActive():Boolean{return users;}
		public static function get videoDockActive():Boolean{return videoDock;}
		public static function get presentationActive():Boolean{return presentation;}
		public static function get chatActive():Boolean{return chat;}
		public static function get pollingActive():Boolean{return polling;}
		public static function get webcamActive():Boolean{return webcam;}		
		public static function get deskshareActive():Boolean{return deskshare;}
		public static function get audioActive():Boolean{return audio;}
		
		public static function debugString():String{
			return "USERS: " + users + " VIDEODOCK: " + videoDock + " PRESENTATION: " + presentation + " CHAT: " + chat + " POLLING: " + polling + " WEBCAM: " + webcam + " DESKSHARE: " + deskshare + " AUDIO: " + audio;
		}
	}
}