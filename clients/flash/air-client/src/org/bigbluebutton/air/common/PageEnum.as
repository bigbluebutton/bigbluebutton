package org.bigbluebutton.air.common {
	
	import flash.utils.Dictionary;
	
	import org.bigbluebutton.air.chat.views.chat.ChatView;
	import org.bigbluebutton.air.chat.views.chatrooms.ChatRoomsView;
	import org.bigbluebutton.air.chat.views.selectparticipant.SelectParticipantView;
	import org.bigbluebutton.air.deskshare.views.DeskshareView;
	import org.bigbluebutton.air.main.views.disconnectpage.DisconnectPageView;
	import org.bigbluebutton.air.main.views.exit.ExitPageView;
	import org.bigbluebutton.air.main.views.loginpage.LoginPageView;
	import org.bigbluebutton.air.main.views.profile.ProfileView;
	import org.bigbluebutton.air.presentation.views.PresentationView;
	import org.bigbluebutton.air.settings.views.audio.AudioSettingsView;
	import org.bigbluebutton.air.settings.views.camera.CameraSettingsView;
	import org.bigbluebutton.air.settings.views.lock.LockSettingsView;
	import org.bigbluebutton.air.users.views.participants.ParticipantsView;
	import org.bigbluebutton.air.users.views.userdetails.UserDetailsView;
	import org.bigbluebutton.air.video.views.videochat.VideoChatView;
	
	public class PageEnum {
		public static const PRESENTATION:String = "presentation";
		
		public static const LOGIN:String = "login";
		
		public static const PROFILE:String = "profile";
		
		public static const STATUS:String = "Status";
		
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
				dic[EXIT] = ExitPageView;
				dic[LOCKSETTINGS] = LockSettingsView;
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
