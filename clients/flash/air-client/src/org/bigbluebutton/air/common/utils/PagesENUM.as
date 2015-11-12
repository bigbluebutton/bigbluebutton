package org.bigbluebutton.air.common.utils {
	
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.air.chat.views.ChatRoomsView;
	import org.bigbluebutton.air.chat.views.ChatView;
	import org.bigbluebutton.air.chat.views.SelectParticipantView;
	import org.bigbluebutton.air.deskshare.views.DeskshareView;
	import org.bigbluebutton.air.main.views.DisconnectPageView;
	import org.bigbluebutton.air.main.views.LoginPageView;
	import org.bigbluebutton.air.main.views.ProfileView;
	import org.bigbluebutton.air.presentation.views.PresentationView;
	import org.bigbluebutton.air.settings.views.AudioSettingsView;
	import org.bigbluebutton.air.settings.views.CameraSettingsView;
	import org.bigbluebutton.air.users.views.ParticipantsView;
	import org.bigbluebutton.air.users.views.UserDetailsView;
	import org.bigbluebutton.air.video.views.VideoChatView;
	
	public class PagesENUM {
		public static const PRESENTATION:String = "presentation";
		
		public static const LOGIN:String = "login";
		
		public static const PROFILE:String = "profile";
		
		public static const USER_DETAILS:String = "userdetails";
		
		public static const VIDEO_CHAT:String = "videochat";
		
		public static const CHATROOMS:String = "chatrooms";
		
		public static const CHAT:String = "chat";
		
		public static const PARTICIPANTS:String = "participants";
		
		public static const SELECT_PARTICIPANT:String = "selectparticipant";
		
		public static const DISCONNECT:String = "Disconnect";
		
		public static const DESKSHARE:String = "Deskshare";
		
		public static const CAMERASETTINGS:String = "CameraSettings";
		
		public static const AUDIOSETTINGS:String = "AudioSettings";
		
		/**
		 * Especials
		 */
		public static const LAST:String = "last";
		
		protected static function init():void {
			if (!dicInitiated) {
				dic[PRESENTATION] = PresentationView;
				dic[LOGIN] = LoginPageView;
				dic[PROFILE] = ProfileView;
				dic[USER_DETAILS] = UserDetailsView;
				dic[VIDEO_CHAT] = VideoChatView;
				dic[CHATROOMS] = ChatRoomsView;
				dic[CHAT] = ChatView;
				dic[PARTICIPANTS] = ParticipantsView;
				dic[SELECT_PARTICIPANT] = SelectParticipantView;
				dic[DISCONNECT] = DisconnectPageView;
				dic[DESKSHARE] = DeskshareView;
				dic[CAMERASETTINGS] = CameraSettingsView;
				dic[AUDIOSETTINGS] = AudioSettingsView;
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
