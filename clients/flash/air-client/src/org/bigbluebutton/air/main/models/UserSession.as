package org.bigbluebutton.air.main.models {
	
	import org.bigbluebutton.air.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.air.presentation.models.PresentationList;
	import org.bigbluebutton.air.screenshare.services.IScreenshareConnection;
	import org.bigbluebutton.air.video.models.VideoProfileManager;
	import org.bigbluebutton.air.video.services.IVideoConnection;
	import org.bigbluebutton.air.voice.models.PhoneOptions;
	import org.bigbluebutton.air.voice.services.IVoiceConnection;
	import org.bigbluebutton.air.voice.services.VoiceStreamManager;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class UserSession implements IUserSession {
		protected var _config:Config;
		
		protected var _userId:String;
		
		protected var _mainConnection:IBigBlueButtonConnection;
		
		protected var _voiceConnection:IVoiceConnection;
		
		protected var _voiceStreamManager:VoiceStreamManager;
		
		protected var _videoConnection:IVideoConnection;
		
		protected var _screenshareConnection:IScreenshareConnection;
		
		protected var _presentationList:PresentationList;
		
		protected var _phoneOptions:PhoneOptions;
		
		protected var _videoAutoStart:Boolean;
		
		protected var _skipCamSettingsCheck:Boolean;
		
		protected var _meetingMuted:Boolean;
		
		protected var _joinUrl:String;
			
		protected var _pushToTalk:Boolean;
		
		protected var _assignedDeskshareSignal:ISignal = new Signal();
		
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
		
		public function get screenshareConnection():IScreenshareConnection {
			return _screenshareConnection;
		}
		
		public function set screenshareConnection(value:IScreenshareConnection):void {
			_screenshareConnection = value;
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
		}
		
		public function get presentationList():PresentationList {
			return _presentationList;
		}
		
		public function get assignedDeskshareSignal():ISignal {
			return _assignedDeskshareSignal;
		}
		
		public function get logoutSignal():Signal {
			return _logoutSignal;
		}
		
		public function get pushToTalkSignal():ISignal {
			return _pushToTalkSignal;
		}
		
		public function get authTokenSignal():ISignal {
			return _authTokenSignal;
		}
	
	}
}
