package org.bigbluebutton.web.main.models {
	import org.bigbluebutton.lib.main.models.IUserSession;

	//import org.bigbluebutton.core.BBB;
	public class ShortcutOptions implements IShortcutOptions
	{
		[Inject]
		public var userSession:IUserSession;
		
		private var users:Boolean = true;
		private var videoDock:Boolean = true;
		private var presentation:Boolean = true;
		private var chat:Boolean = true;
		private var polling:Boolean = true;
		private var webcam:Boolean = true;
		private var deskshare:Boolean = true;
		private var audio:Boolean = true;
		private var generalResource:Array;
		
		public function initKeys():void{
			var vxml:XML;
			
			vxml = userSession.config.getConfigFor("UsersModule");
			if (vxml == null) {
				users = false;
			}
			
			vxml = userSession.config.getConfigFor("VideodockModule");
			if (vxml == null) {
				videoDock = false;
			}
			
			vxml = userSession.config.getConfigFor("PresentModule");
			if (vxml == null) {
				presentation = false;
			}
			
			vxml = userSession.config.getConfigFor("ChatModule");
			if (vxml == null) {
				chat = false;
			}
			
			vxml = userSession.config.getConfigFor("PollingModule");
			if (vxml == null) {
				polling = false;
			}
			
			vxml = userSession.config.getConfigFor("VideoconfModule");
			if (vxml == null) {
				webcam = false;
			}
			
			vxml = userSession.config.getConfigFor("DeskShareModule");
			if (vxml == null) {
				deskshare = false;
			}
			
			vxml = userSession.config.getConfigFor("PhoneModule");
			if (vxml == null) {
				audio = false;
			}
			
			generalResource = new Array();
			generateGlobalKeys();
		}
		
		public function get usersActive():Boolean{return users;}
		public function get videoDockActive():Boolean{return videoDock;}
		public function get presentationActive():Boolean{return presentation;}
		public function get chatActive():Boolean{return chat;}
		public function get pollingActive():Boolean{return polling;}
		public function get webcamActive():Boolean{return webcam;}		
		public function get deskshareActive():Boolean{return deskshare;}
		public function get audioActive():Boolean{return audio;}
		public function get genResource():Array{return generalResource;}
		
		private function generateGlobalKeys():void{
			generalResource = new Array();
			
			generalResource.push('bbb.shortcutkey.general.minimize');
			generalResource.push('bbb.shortcutkey.general.maximize');
			generalResource.push('bbb.shortcutkey.flash.exit');
			
			if (users){generalResource.push('bbb.shortcutkey.focus.users');}
			if (videoDock){generalResource.push('bbb.shortcutkey.focus.video');}
			if (presentation){generalResource.push('bbb.shortcutkey.focus.presentation');}
			if (chat){generalResource.push('bbb.shortcutkey.focus.chat');}
			if (polling){
				generalResource.push('bbb.shortcutkey.focus.pollingCreate'); 
				generalResource.push('bbb.shortcutkey.focus.pollingStats'); 
				generalResource.push('bbb.shortcutkey.focus.voting');
			}
			
			if (audio){
				generalResource.push('bbb.shortcutkey.share.microphone');
				generalResource.push('bbb.shortcutkey.share.pauseRemoteStream');
			}
			if (deskshare){generalResource.push('bbb.shortcutkey.share.desktop');}
			if (webcam){generalResource.push('bbb.shortcutkey.share.webcam');}
			if (polling){generalResource.push('bbb.shortcutkey.polling.buttonClick');}
			generalResource.push('bbb.shortcutkey.shortcutWindow');
			generalResource.push('bbb.shortcutkey.logout');
			
			if (users){generalResource.push('bbb.shortcutkey.raiseHand');}
			if (audio){generalResource.push('bbb.shortcutkey.users.muteme');}
			if (audio){generalResource.push('bbb.shortcutkey.users.muteAllButPres');}
			if (chat){generalResource.push('bbb.shortcutkey.chat.chatinput');}
		}
		
		public function debugString():String{
			return "USERS: " + users + " VIDEODOCK: " + videoDock + " PRESENTATION: " + presentation + " CHAT: " + chat + " POLLING: " + polling + " WEBCAM: " + webcam + " DESKSHARE: " + deskshare + " AUDIO: " + audio;
		}
	}
}