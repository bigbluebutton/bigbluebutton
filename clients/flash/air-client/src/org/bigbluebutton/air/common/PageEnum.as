package org.bigbluebutton.air.common {
	
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.air.chat.views.ChatRoomView;
	import org.bigbluebutton.air.main.views.MainView;
	import org.bigbluebutton.air.main.views.DisconnectView;
	import org.bigbluebutton.air.main.views.ExitView;
	import org.bigbluebutton.air.participants.views.ParticipantsView;
	import org.bigbluebutton.air.settings.views.SettingsView;
	import org.bigbluebutton.air.settings.views.audio.AudioSettingsView;
	import org.bigbluebutton.air.settings.views.camera.CameraSettingsView;
	import org.bigbluebutton.air.settings.views.chat.ChatSettingsView;
	import org.bigbluebutton.air.settings.views.lock.LockSettingsView;
	import org.bigbluebutton.air.users.views.UserDetailsView;
	import org.bigbluebutton.air.voice.views.EchoTestView;
	
	public class PageEnum {
		public static const MAIN:String = "main";
		
		public static const PROFILE:String = "profile";
		
		public static const STATUS:String = "Status";
		
		public static const USER_DETAILS:String = "userdetails";
		
		public static const CHAT:String = "chat";
		
		public static const PARTICIPANTS:String = "participants";
		
		public static const DISCONNECT:String = "Disconnect";
		
		public static const CAMERASETTINGS:String = "CameraSettings";
		
		public static const AUDIOSETTINGS:String = "AudioSettings";
		
		public static const CHATSETTINGS:String = "ChatSettings";
		
		public static const LOCKSETTINGS:String = "LockSettings";
		
		public static const EXIT:String = "Exit";
		
		public static const SETTINGS:String = "Settings";
		
		public static const ECHOTEST:String = "EchoTest";
		
		public static const APPLICATION_SETTINGS:String = "ApplicationSettings";
		
		/**
		 * Especials
		 */
		public static const LAST:String = "last";
		
		protected static function init():void {
			if (!dicInitiated) {
				dic[MAIN] = MainView;
				dic[PARTICIPANTS] = ParticipantsView;
				dic[CHAT] = ChatRoomView;
				dic[SETTINGS] = SettingsView;
				dic[ECHOTEST] = EchoTestView;
				dic[AUDIOSETTINGS] = AudioSettingsView;
				dic[CAMERASETTINGS] = CameraSettingsView;
				dic[CHATSETTINGS] = ChatSettingsView;
				dic[LOCKSETTINGS] = LockSettingsView;
				//		dic[PROFILE] = ProfileView;
				dic[USER_DETAILS] = UserDetailsView;
				//		dic[VIDEO_CHAT] = VideoChatView;
				//		dic[CHATROOMS] = ChatRoomsView;
				//		dic[SELECT_PARTICIPANT] = SelectParticipantView;
				dic[DISCONNECT] = DisconnectView;
				//		dic[DESKSHARE] = DeskshareView;
				dic[EXIT] = ExitView;
				dicInitiated = true;
			}
		}
		
		protected static var dic:Dictionary = new Dictionary();
		
		protected static var dicInitiated:Boolean = false;
		
		public static function contain(name:String):Boolean {
			init();
			return (dic[name] != null)
		}
		
		public static function getClassfromName(name:String):Class {
			init();
			var klass:Class = null;
			if (contain(name)) {
				klass = dic[name];
			}
			return klass;
		}
	}
}
