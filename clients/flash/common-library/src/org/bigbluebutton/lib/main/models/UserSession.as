package org.bigbluebutton.lib.main.models {
	
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.presentation.models.PresentationList;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
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
		
		protected var _userList:UserList;
		
		protected var _presentationList:PresentationList;
		
		protected var _recording:Boolean;
		
		protected var _guestSignal:ISignal = new Signal();
		
		protected var _successJoiningMeetingSignal:ISignal = new Signal();
		
		protected var _failureJoiningMeetingSignal:ISignal = new Signal();
		
		protected var _recordingStatusChangedSignal:ISignal = new Signal();
		
		protected var _logoutSignal:Signal = new Signal();
		
		public function get userList():UserList {
			return _userList;
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
		}
		
		public function UserSession() {
			_userList = new UserList();
			_presentationList = new PresentationList();
		}
		
		public function get presentationList():PresentationList {
			return _presentationList
		}
		
		public function get guestSignal():ISignal {
			return _guestSignal;
		}
		
		public function get successJoiningMeetingSignal():ISignal {
			return _successJoiningMeetingSignal;
		}
		
		public function get failureJoiningMeetingSignal():ISignal {
			return _failureJoiningMeetingSignal;
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
		
		public function get recordingStatusChangedSignal():ISignal {
			return _recordingStatusChangedSignal;
		}
		
		public function recordingStatusChanged(recording:Boolean):void {
			_recording = recording;
			recordingStatusChangedSignal.dispatch(recording);
		}
	}
}
