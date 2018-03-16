package org.bigbluebutton.air.main.commands {
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.air.chat.services.IChatMessageService;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.air.main.utils.DisconnectEnum;
	import org.bigbluebutton.air.presentation.services.IPresentationService;
	import org.bigbluebutton.air.screenshare.services.IScreenshareConnection;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.models.UserChangeEnum;
	import org.bigbluebutton.air.user.services.IUsersService;
	import org.bigbluebutton.air.video.commands.ShareCameraSignal;
	import org.bigbluebutton.air.video.services.IVideoConnection;
	import org.bigbluebutton.air.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.air.voice.models.PhoneOptions;
	import org.bigbluebutton.air.voice.services.IVoiceConnection;
	import org.bigbluebutton.air.voice.services.IVoiceService;
	import org.bigbluebutton.air.whiteboard.services.IWhiteboardService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectCommand extends Command {
		private const LOG:String = "ConnectCommand::";
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var connection:IBigBlueButtonConnection;
		
		[Inject]
		public var videoConnection:IVideoConnection;
		
		[Inject]
		public var voiceConnection:IVoiceConnection;
		
		[Inject]
		public var screenshareConnection:IScreenshareConnection;
		
		[Inject]
		public var uri:String;
		
		[Inject]
		public var whiteboardService:IWhiteboardService;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var voiceService:IVoiceService;
		
		[Inject]
		public var chatService:IChatMessageService;
		
		[Inject]
		public var presentationService:IPresentationService;
		
		[Inject]
		public var connectingFinishedSignal:ConnectingFinishedSignal;
		
		[Inject]
		public var connectingFailedSignal:ConnectingFailedSignal;
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		private var authTokenTimeout:Timer;
		
		private var joinMeetingTimeout:Timer;
		
		override public function execute():void {
			loadConfigOptions();
			connection.uri = uri;
			connection.connectionSuccessSignal.add(connectionSuccess);
			connection.connectionFailureSignal.add(connectionFailure);
			connection.connect(conferenceParameters);
		}
		
		private function loadConfigOptions():void {
			userSession.phoneOptions = new PhoneOptions(userSession.config.getConfigFor("PhoneModule"));
			userSession.videoAutoStart = (userSession.config.getConfigFor("VideoconfModule").@autoStart.toString().toUpperCase() == "TRUE") ? true : false;
			userSession.skipCamSettingsCheck = (userSession.config.getConfigFor("VideoconfModule").@skipCamSettingsCheck.toString().toUpperCase() == "TRUE") ? true : false;
		}
		
		private function connectionSuccess():void {
			trace(LOG + "successConnected()");
			userSession.mainConnection = connection;
			chatService.setupMessageSenderReceiver();
			whiteboardService.setupMessageSenderReceiver();
			// Set up users message sender in order to send the "joinMeeting" message:
			usersService.setupMessageSenderReceiver();
			voiceService.setupMessageSenderReceiver();
			//send the join meeting message, then wait for the response
			userSession.authTokenSignal.add(onAuthTokenReply);
			usersService.validateToken();
			connection.connectionSuccessSignal.remove(connectionSuccess);
			connection.connectionFailureSignal.remove(connectionFailure);
			
			authTokenTimeout = new Timer(10000, 1);
			authTokenTimeout.addEventListener(TimerEvent.TIMER, onAuthTokenTimeout);
			authTokenTimeout.start();
		}
		
		private function onAuthTokenReply(tokenValid:Boolean):void {
			userSession.authTokenSignal.remove(onAuthTokenReply);
			authTokenTimeout.stop();
			
			if (tokenValid) {
				joiningMeetingSuccess();
			} else {
				joiningMeetingFailure(DisconnectEnum.AUTH_TOKEN_INVALID);
			}
		}
		
		private function onAuthTokenTimeout(e:TimerEvent):void {
			trace(LOG + "onAuthTokenTimeout - timeout hit");
			userSession.authTokenSignal.remove(onAuthTokenReply);
			
			joiningMeetingFailure(DisconnectEnum.AUTH_TOKEN_TIMEOUT);
		}
		
		private function joiningMeetingSuccess():void {
			// Set up remaining message sender and receivers:
			presentationService.setupMessageSenderReceiver();
			// set up and connect the remaining connections
			videoConnection.uri = userSession.config.getConfigFor("VideoConfModule").@uri + "/" + conferenceParameters.room;
			//TODO see if videoConnection.successConnected is dispatched when it's connected properly
			videoConnection.connectionSuccessSignal.add(videoConnectedSuccess);
			videoConnection.connectionFailureSignal.add(videoConnectionFailure);
			videoConnection.connect();
			userSession.videoConnection = videoConnection;
			voiceConnection.uri = userSession.config.getConfigFor("PhoneModule").@uri;
			userSession.voiceConnection = voiceConnection;
			
			var audioOptions:Object = new Object();
			if (userSession.phoneOptions.autoJoin && userSession.phoneOptions.skipCheck) {
				var forceListenOnly:Boolean = (userSession.config.getConfigFor("PhoneModule").@forceListenOnly.toString().toUpperCase() == "TRUE") ? true : false;
					//audioOptions.shareMic = userSession.userList.me.voiceJoined = !forceListenOnly;
					//audioOptions.listenOnly = userSession.userList.me.listenOnly = forceListenOnly;
					//shareMicrophoneSignal.dispatch(audioOptions);
			} else {
				//audioOptions.shareMic = userSession.userList.me.voiceJoined = false;
				//audioOptions.listenOnly = userSession.userList.me.listenOnly = true;
				//shareMicrophoneSignal.dispatch(audioOptions);
			}
			
			trace("Configuring Screenshare");
			screenshareConnection.uri = userSession.config.getConfigFor("ScreenshareModule").@uri;
			screenshareConnection.connect();
			userSession.screenshareConnection = screenshareConnection;
			
			usersService.joinMeeting();
			// Query the server for chat, users, and presentation info
			chatService.getGroupChats();
			presentationService.getPresentationPods();
			meetingData.users.userChangeSignal.add(successUsersAdded);
			usersService.queryForParticipants();
			usersService.getLockSettings();
			usersService.queryForRecordingStatus();
			usersService.queryForScreenshare();
			userSession.successJoiningMeetingSignal.remove(joiningMeetingSuccess);
			userSession.failureJoiningMeetingSignal.remove(joiningMeetingFailure);
			usersService.getRoomLockState();
			meetingData.users.userChangeSignal.add(userChangeListener);
			joinMeetingTimeout = new Timer(5000, 1);
			joinMeetingTimeout.addEventListener(TimerEvent.TIMER, onJoinMeetingTimeout);
			joinMeetingTimeout.start();
		}
		
		// reason is one of the DisconnectEnum types
		private function joiningMeetingFailure(reason:int):void {
			trace(LOG + "joiningMeetingFailure() -- Failed to join the meeting!!!");
			disconnectUserSignal.dispatch(reason);
		}
		
		private function userChangeListener(user:User2x, enum:int):void {
			// If we fetch data before the server has recognized the join we can get disconnected. Need
			// to delay the fetch until after the join is received back.
			if (user.me && enum == UserChangeEnum.JOIN) {
				meetingData.users.userChangeSignal.remove(userChangeListener);
				joinMeetingTimeout.stop();
				
				// Query the server for chat, users, and presentation info
				chatService.getGroupChats();
				presentationService.getPresentationPods();
				meetingData.users.userChangeSignal.add(successUsersAdded);
				usersService.queryForParticipants();
				usersService.getLockSettings();
				usersService.getRoomLockState();
				
				videoConnection.loadCameraSettings();
			}
		}
		
		private function onJoinMeetingTimeout(e:TimerEvent):void {
			trace(LOG + "onJoinMeetingTimeout - timeout hit");
			meetingData.users.userChangeSignal.remove(userChangeListener);
			
			joiningMeetingFailure(DisconnectEnum.JOIN_MEETING_TIMEOUT);
		}
		
		protected function successUsersAdded(user:User2x, property:int):void {
			meetingData.users.userChangeSignal.remove(successUsersAdded);
			connectingFinishedSignal.dispatch();
		}
		
		private function connectionFailure(reason:String):void {
			trace(LOG + "connectionFailure()");
			connectingFailedSignal.dispatch("connectionFailed");
			connection.connectionSuccessSignal.remove(connectionSuccess);
			connection.connectionFailureSignal.remove(connectionFailure);
		}
		
		private function videoConnectedSuccess():void {
			trace(LOG + "successVideoConnected()");
			videoConnection.connectionSuccessSignal.remove(videoConnectedSuccess);
			videoConnection.connectionFailureSignal.remove(videoConnectionFailure);
		}
		
		private function videoConnectionFailure(reason:String):void {
			trace(LOG + "videoConnectionFailure()");
			videoConnection.connectionFailureSignal.remove(videoConnectionFailure);
			videoConnection.connectionSuccessSignal.remove(videoConnectedSuccess);
		}
	}
}
