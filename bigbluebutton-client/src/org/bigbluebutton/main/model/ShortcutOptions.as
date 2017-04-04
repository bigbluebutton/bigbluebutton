package org.bigbluebutton.main.model
{
	import org.bigbluebutton.core.BBB;

	public class ShortcutOptions
	{
		private static var users:Boolean = true;
		private static var presentation:Boolean = true;
		private static var chat:Boolean = true;
		private static var polling:Boolean = true;
		private static var webcam:Boolean = true;
		private static var closedCaption:Boolean = true;
		private static var deskshare:Boolean = true;
		private static var audio:Boolean = true;
		private static var generalResource:Array;
		
		public static function initialize():void {
			var vxml:XML;
			
			vxml = BBB.getConfigForModule("UsersModule");
			if (vxml == null) {
				users = false;
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
			
			vxml = BBB.getConfigForModule("CaptionModule");
			if (vxml == null) {
				closedCaption = false;
			}
			
			generalResource = new Array();
			generateGlobalKeys();
		}
		
		public static function get usersActive():Boolean{return users;}
		public static function get presentationActive():Boolean{return presentation;}
		public static function get chatActive():Boolean{return chat;}
		public static function get pollingActive():Boolean{return polling;}
		public static function get webcamActive():Boolean{return webcam;}	
		public static function get closedCaptionActive():Boolean{return closedCaption;}
		public static function get deskshareActive():Boolean{return deskshare;}
		public static function get audioActive():Boolean{return audio;}
		public static function get genResource():Array{return generalResource;}
		
		private static function generateGlobalKeys():void{
			generalResource = new Array();
			
			generalResource.push('bbb.shortcutkey.general.minimize');
			generalResource.push('bbb.shortcutkey.general.maximize');
			generalResource.push('bbb.shortcutkey.flash.exit');
			
			if (users){generalResource.push('bbb.shortcutkey.focus.users');}
			if (webcam){generalResource.push('bbb.shortcutkey.focus.video');}
			if (presentation){generalResource.push('bbb.shortcutkey.focus.presentation');}
			if (chat){generalResource.push('bbb.shortcutkey.focus.chat');}
			if (closedCaption){generalResource.push('bbb.shortcutkey.focus.caption');}
			
			if (deskshare){generalResource.push('bbb.shortcutkey.share.desktop');}
			if (webcam){generalResource.push('bbb.shortcutkey.share.webcam');}
			generalResource.push('bbb.shortcutkey.shortcutWindow');
			generalResource.push('bbb.shortcutkey.logout');
			
			if (users){generalResource.push('bbb.shortcutkey.raiseHand');}
			if (users){generalResource.push('bbb.shortcutkey.users.breakoutRooms');}
			if (audio){generalResource.push('bbb.shortcutkey.users.muteme');}
			if (audio){generalResource.push('bbb.shortcutkey.users.muteAllButPres');}
			if (chat){generalResource.push('bbb.shortcutkey.chat.chatinput');}
		}
		
		public static function debugString():String{
			return "USERS: " + users + " PRESENTATION: " + presentation + " CHAT: " + chat + " CLOSED CAPTION: " + closedCaption + " POLLING: " + polling + " WEBCAM: " + webcam + " DESKSHARE: " + deskshare + " AUDIO: " + audio;
		}
	}
}
