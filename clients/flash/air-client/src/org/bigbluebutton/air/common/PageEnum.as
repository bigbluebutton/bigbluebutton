package org.bigbluebutton.air.common {
	
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.air.chat.views.ChatRoomView;
	import org.bigbluebutton.air.main.views.MainView;
	import org.bigbluebutton.air.participants.views.ParticipantsView;
	
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
		
		public static const EXIT:String = "Exit";
		
		public static const LOCKSETTINGS:String = "LockSettings";
		
		public static const SPLITSETTINGS:String = "SplitSettings";
		
		public static const SPLITPARTICIPANTS:String = "SplitParticipants";
		
		public static const SPLITCHAT:String = "SplitChat";
		
		/**
		 * Especials
		 */
		public static const LAST:String = "last";
		
		protected static function init():void {
			if (!dicInitiated) {
				dic[MAIN] = MainView;
				dic[PARTICIPANTS] = ParticipantsView;
				dic[CHAT] = ChatRoomView;
		//		dic[PROFILE] = ProfileView;
		//		dic[USER_DETAILS] = UserDetailsView;
		//		dic[VIDEO_CHAT] = VideoChatView;
		//		dic[CHATROOMS] = ChatRoomsView;
		//		dic[PARTICIPANTS] = ParticipantsView;
		//		dic[SELECT_PARTICIPANT] = SelectParticipantView;
		//		dic[DISCONNECT] = DisconnectPageView;
		//		dic[DESKSHARE] = DeskshareView;
		//		dic[CAMERASETTINGS] = CameraSettingsView;
		//		dic[AUDIOSETTINGS] = AudioSettingsView;
		//		dic[EXIT] = ExitPageView;
		//		dic[LOCKSETTINGS] = LockSettingsView;
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
