package org.bigbluebutton.lib.main.commands {
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.lib.voice.models.PhoneOptions;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.whiteboard.services.IWhiteboardService;
	
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
		public var deskshareConnection:IDeskshareConnection;
		
		[Inject]
		public var uri:String;
		
		[Inject]
		public var whiteboardService:IWhiteboardService;
		
		[Inject]
		public var usersService:IUsersService;
		
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
			
			trace("Configuring deskshare");
			//deskshareConnection.applicationURI = userSession.config.getConfigFor("DeskShareModule").@uri;
			//deskshareConnection.room = conferenceParameters.room;
			//deskshareConnection.connect();
			//userSession.deskshareConnection = deskshareConnection;
			usersService.joinMeeting();
			// Query the server for chat, users, and presentation info
			chatService.getGroupChats();
			presentationService.getPresentationPods();
			meetingData.users.userChangeSignal.add(successUsersAdded);
			usersService.queryForParticipants();
			usersService.getLockSettings();
			usersService.queryForRecordingStatus();
			userSession.successJoiningMeetingSignal.remove(joiningMeetingSuccess);
			userSession.failureJoiningMeetingSignal.remove(joiningMeetingFailure);
			usersService.getRoomLockState();
		}
		
		// reason is one of the DisconnectEnum types
		private function joiningMeetingFailure(reason:int):void {
			trace(LOG + "joiningMeetingFailure() -- Failed to join the meeting!!!");
			userSession.successJoiningMeetingSignal.remove(joiningMeetingSuccess);
			userSession.failureJoiningMeetingSignal.remove(joiningMeetingFailure);
			
			disconnectUserSignal.dispatch(reason);
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
			if (userSession.videoAutoStart && userSession.skipCamSettingsCheck) {
				trace("TODO: Need to implement auto start cam still");
				//shareCameraSignal.dispatch(!userSession.userList.me.hasStream, userSession.videoConnection.cameraPosition);
			}
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
