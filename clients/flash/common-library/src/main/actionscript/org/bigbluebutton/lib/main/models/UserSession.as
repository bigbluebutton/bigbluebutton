package org.bigbluebutton.lib.main.models {
	
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.presentation.models.PresentationList;
	import org.bigbluebutton.lib.video.models.VideoProfileManager;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.voice.models.PhoneOptions;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.voice.services.VoiceStreamManager;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class UserSession implements IUserSession {
		protected var _config:Config;
		
		protected var _userId:String;
		
		protected var _mainConnection:IBigBlueButtonConnection;
		
		protected var _voiceConnection:IVoiceConnection;
		
		protected var _voiceStreamManager:VoiceStreamManager;
		
		protected var _videoConnection:IVideoConnection;
		
		protected var _deskshareConnection:IDeskshareConnection;
		
		protected var _presentationList:PresentationList;
				
		protected var _recording:Boolean;
		
		protected var _phoneOptions:PhoneOptions;
		
		protected var _videoAutoStart:Boolean;
		
		protected var _skipCamSettingsCheck:Boolean;
		
		protected var _meetingMuted:Boolean;
		
		protected var _joinUrl:String;
		
		protected var _lockSettings:LockSettings;
		
		protected var _pushToTalk:Boolean;
		
		protected var _successJoiningMeetingSignal:ISignal = new Signal();
		
		protected var _failureJoiningMeetingSignal:ISignal = new Signal();
		
		protected var _assignedDeskshareSignal:ISignal = new Signal();
		
		protected var _recordingStatusChangedSignal:ISignal = new Signal();
		
		protected var _logoutSignal:Signal = new Signal();
		
		protected var _authTokenSignal:ISignal = new Signal();
		
		protected var _pushToTalkSignal:ISignal = new Signal();
		
		protected var _videoProfileManager:VideoProfileManager = new VideoProfileManager();
		
		public function get phoneOptions():PhoneOptions {
			return _phoneOptions;
		}
		
		public function set phoneOptions(value:PhoneOptions):void {
			_phoneOptions = value;
		}
		
		public function get videoProfileManager():VideoProfileManager {
			return _videoProfileManager;
		}
		
		public function set videoProfileManager(value:VideoProfileManager):void {
			_videoProfileManager = value;
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
			_presentationList = new PresentationList();
			_lockSettings = new LockSettings();
		}
		
		public function get presentationList():PresentationList {
			return _presentationList;
		}
		
		public function get successJoiningMeetingSignal():ISignal {
			return _successJoiningMeetingSignal;
		}
		
		public function get failureJoiningMeetingSignal():ISignal {
			return _failureJoiningMeetingSignal;
		}
		
		public function get assignedDeskshareSignal():ISignal {
			return _assignedDeskshareSignal;
		}
		
		public function joinMeetingResponse(msg:Object):void {
			if (msg.user) {
				_successJoiningMeetingSignal.dispatch();
			} else {
				_failureJoiningMeetingSignal.dispatch();
			}
		}
		
		public function get logoutSignal():Signal {
			return _logoutSignal;
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
	}
}
