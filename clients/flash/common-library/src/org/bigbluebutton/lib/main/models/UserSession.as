package org.bigbluebutton.lib.main.models {
	
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.presentation.models.PresentationList;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	import org.bigbluebutton.lib.video.models.VideoProfileManager;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.voice.models.PhoneOptions;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.voice.services.VoiceStreamManager;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class UserSession implements IUserSession {
		public static const GUEST_POLICY_ASK_MODERATOR:String = "ASK_MODERATOR";
		
		public static const GUEST_POLICY_ALWAYS_DENY:String = "ALWAYS_DENY";
		
		public static const GUEST_POLICY_ALWAYS_ACCEPT:String = "ALWAYS_ACCEPT";
		
		protected var _config:Config;
		
		protected var _userId:String;
		
		protected var _mainConnection:IBigBlueButtonConnection;
		
		protected var _voiceConnection:IVoiceConnection;
		
		protected var _voiceStreamManager:VoiceStreamManager;
		
		protected var _videoConnection:IVideoConnection;
		
		protected var _deskshareConnection:IDeskshareConnection;
		
		protected var _userList:UserList;
		
		protected var _guestList:UserList;
		
		protected var _presentationList:PresentationList;
		
		protected var _recording:Boolean;
		
		protected var _phoneAutoJoin:Boolean;
		
		protected var _phoneSkipCheck:Boolean;
		
		protected var _videoAutoStart:Boolean;
		
		protected var _skipCamSettingsCheck:Boolean;
		
		protected var _meetingMuted:Boolean;
		
		protected var _joinUrl:String;
		
		protected var _globalVideoStreamName:String = "";
		
		protected var _lockSettings:LockSettings;
		
		protected var _pushToTalk:Boolean;
		
		protected var _guestPolicySignal:ISignal = new Signal();
		
		protected var _loadedMessageHistorySignal:ISignal = new Signal();
		
		protected var _guestEntranceSignal:ISignal = new Signal();
		
		protected var _successJoiningMeetingSignal:ISignal = new Signal();
		
		protected var _unsuccessJoiningMeetingSignal:ISignal = new Signal();
		
		protected var _assignedDeskshareSignal:ISignal = new Signal();
		
		protected var _recordingStatusChangedSignal:ISignal = new Signal();
		
		protected var _logoutSignal:Signal = new Signal();
		
		protected var _authTokenSignal:ISignal = new Signal();
		
		protected var _globalVideoSignal:ISignal = new Signal();
		
		protected var _pushToTalkSignal:ISignal = new Signal();
		
		protected var _videoProfileManager:VideoProfileManager = new VideoProfileManager();
		
		protected var _globalVideoProfile:VideoProfile = _videoProfileManager.defaultVideoProfile;
		
		public function get videoProfileManager():VideoProfileManager {
			return _videoProfileManager;
		}
		
		public function set videoProfileManager(value:VideoProfileManager):void {
			_videoProfileManager = value;
		}
		
		public function get userList():UserList {
			return _userList;
		}
		
		public function set userList(userList:UserList):void {
			_userList = userList;
		}
		
		public function set guestList(userList:UserList):void {
			_guestList = userList;
		}
		
		public function get guestList():UserList {
			return _guestList;
		}
		
		public function get phoneAutoJoin():Boolean {
			return _phoneAutoJoin;
		}
		
		public function set phoneAutoJoin(value:Boolean):void {
			_phoneAutoJoin = value;
		}
		
		public function get phoneSkipCheck():Boolean {
			return _phoneSkipCheck;
		}
		
		public function set phoneSkipCheck(value:Boolean):void {
			_phoneSkipCheck = value;
		}
		
		public function get lockSettings():LockSettings {
			return _lockSettings;
		}
		
		public function get meetingMuted():Boolean {
			return _meetingMuted;
		}
		
		public function set meetingMuted(mute:Boolean):void {
			_meetingMuted = mute;
		}
		
		public function get videoAutoStart():Boolean {
			return _videoAutoStart;
		}
		
		public function set videoAutoStart(value:Boolean):void {
			_videoAutoStart = value;
		}
		
		public function get skipCamSettingsCheck():Boolean {
			return _skipCamSettingsCheck;
		}
		
		public function set skipCamSettingsCheck(value:Boolean):void {
			_skipCamSettingsCheck = value;
		}
		
		public function get config():Config {
			return _config;
		}
		
		public function set config(value:Config):void {
			_config = value;
		}
		
		public function get userId():String {
			return _userId;
		}
		
		public function set userId(value:String):void {
			_userId = value;
			_userList.me.userID = value;
		}
		
		public function get voiceConnection():IVoiceConnection {
			return _voiceConnection;
		}
		
		public function set voiceConnection(value:IVoiceConnection):void {
			_voiceConnection = value;
		}
		
		public function get mainConnection():IBigBlueButtonConnection {
			return _mainConnection;
		}
		
		public function set mainConnection(value:IBigBlueButtonConnection):void {
			_mainConnection = value;
		}
		
		public function get voiceStreamManager():VoiceStreamManager {
			return _voiceStreamManager;
		}
		
		public function set voiceStreamManager(value:VoiceStreamManager):void {
			_voiceStreamManager = value;
		}
		
		public function get videoConnection():IVideoConnection {
			return _videoConnection;
		}
		
		public function set videoConnection(value:IVideoConnection):void {
			_videoConnection = value;
		}
		
		public function get deskshareConnection():IDeskshareConnection {
			return _deskshareConnection;
		}
		
		public function set deskshareConnection(value:IDeskshareConnection):void {
			_deskshareConnection = value;
			_assignedDeskshareSignal.dispatch();
		}
		
		public function get pushToTalk():Boolean {
			return _pushToTalk;
		}
		
		public function set pushToTalk(value:Boolean):void {
			_pushToTalk = value;
			_pushToTalkSignal.dispatch();
		}
		
		public function UserSession() {
			_userList = new UserList();
			_guestList = new UserList();
			_presentationList = new PresentationList();
			_lockSettings = new LockSettings();
			userList.userChangeSignal.add(userChangedHandler);
		}
		
		public function get presentationList():PresentationList {
			return _presentationList
		}
		
		public function get guestEntranceSignal():ISignal {
			return _guestEntranceSignal;
		}
		
		public function get loadedMessageHistorySignal():ISignal {
			return _loadedMessageHistorySignal;
		}
		
		public function get guestPolicySignal():ISignal {
			return _guestPolicySignal;
		}
		
		public function get successJoiningMeetingSignal():ISignal {
			return _successJoiningMeetingSignal;
		}
		
		public function get unsuccessJoiningMeetingSignal():ISignal {
			return _unsuccessJoiningMeetingSignal;
		}
		
		public function get assignedDeskshareSignal():ISignal {
			return _assignedDeskshareSignal;
		}
		
		public function joinMeetingResponse(msg:Object):void {
			if (msg.user) {
				_successJoiningMeetingSignal.dispatch();
			} else {
				_unsuccessJoiningMeetingSignal.dispatch();
			}
		}
		
		public function get logoutSignal():Signal {
			return _logoutSignal;
		}
		
		public function get globalVideoSignal():ISignal {
			return _globalVideoSignal;
		}
		
		public function get pushToTalkSignal():ISignal {
			return _pushToTalkSignal;
		}
		
		public function get recordingStatusChangedSignal():ISignal {
			return _recordingStatusChangedSignal;
		}
		
		public function recordingStatusChanged(recording:Boolean):void {
			_recording = recording;
			recordingStatusChangedSignal.dispatch(recording);
		}
		
		public function get authTokenSignal():ISignal {
			return _authTokenSignal;
		}
		
		public function get joinUrl():String {
			return _joinUrl;
		}
		
		public function set joinUrl(value:String):void {
			_joinUrl = value;
		}
		
		public function set globalVideoStreamName(value:String):void {
			if (value != _globalVideoStreamName) {
				_globalVideoStreamName = value;
				globalVideoSignal.dispatch();
			}
		}
		
		public function get globalVideoStreamName():String {
			return _globalVideoStreamName;
		}
		
		public function get globalVideoProfile():VideoProfile {
			return _globalVideoProfile;
		}
		
		public function setGlobalVideoProfileDimensions(w:int, h:int):void {
			if (_globalVideoProfile) {
				_globalVideoProfile.width = w;
				_globalVideoProfile.height = h;
			}
		}
		
		private function userChangedHandler(user:User, type:int):void {
			if (user && user.me && (type == UserList.PRESENTER) || (type == UserList.MODERATOR)) {
				dispatchLockSettings();
			}
		}
		
		public function dispatchLockSettings():void {
			var userLocked:Boolean = (userList.me.role != User.MODERATOR && !userList.me.presenter && userList.me.locked);
			lockSettings.loaded = true;
			lockSettings.disableCamSignal.dispatch(lockSettings.disableCam && userLocked);
			lockSettings.disableMicSignal.dispatch(lockSettings.disableMic && userLocked);
			lockSettings.disablePrivateChatSignal.dispatch(lockSettings.disablePrivateChat && userLocked);
			lockSettings.disablePublicChatSignal.dispatch(lockSettings.disablePublicChat && userLocked);
		}
	}
}
