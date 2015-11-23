package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.UserSession;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.voice.models.PhoneOptions;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.whiteboard.services.IWhiteboardService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectCommand extends Command {
		private const LOG:String = "ConnectCommand::";
		
		[Inject]
		public var userSession:IUserSession;
		
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
		
		override public function execute():void {			
			loadConfigOptions();
			connection.uri = uri;
			connection.connectionSuccessSignal.add(successConnected);
			connection.connectionFailureSignal.add(unsuccessConnected);
			connection.connect(conferenceParameters);
		}
		
		private function loadConfigOptions():void {
			userSession.phoneAutoJoin = (userSession.config.getConfigFor("PhoneModule").@autoJoin.toString().toUpperCase() == "TRUE") ? true : false;
			userSession.phoneSkipCheck = (userSession.config.getConfigFor("PhoneModule").@skipCheck.toString().toUpperCase() == "TRUE") ? true : false;
			userSession.videoAutoStart = (userSession.config.getConfigFor("VideoconfModule").@autoStart.toString().toUpperCase() == "TRUE") ? true : false;
			userSession.skipCamSettingsCheck = (userSession.config.getConfigFor("VideoconfModule").@skipCamSettingsCheck.toString().toUpperCase() == "TRUE") ? true : false;
		}
		
		
		
		private function successConnected():void {
			trace(LOG + "successConnected()");
			userSession.mainConnection = connection;
			chatService.setupMessageSenderReceiver();
			whiteboardService.setupMessageSenderReceiver();
			userSession.userId = connection.userId;
			// Set up users message sender in order to send the "joinMeeting" message:
			usersService.setupMessageSenderReceiver();
			//send the join meeting message, then wait for the response
			//userSession.successJoiningMeetingSignal.add(successJoiningMeeting);
			//userSession.unsuccessJoiningMeetingSignal.add(unsuccessJoiningMeeting);
			userSession.authTokenSignal.add(onAuthTokenReply);
			userSession.loadedMessageHistorySignal.add(chatService.sendWelcomeMessage);
			usersService.validateToken();
			connection.connectionSuccessSignal.remove(successConnected);
			connection.connectionFailureSignal.remove(unsuccessConnected);
		}
		
		private function onAuthTokenReply(tokenValid:Boolean):void {
			userSession.authTokenSignal.remove(onAuthTokenReply);
			if (tokenValid) {
				if (conferenceParameters.isGuestDefined() && conferenceParameters.guest) {
					userSession.guestPolicySignal.add(onGuestPolicyResponse);
					usersService.getGuestPolicy();
				} else {
					successJoiningMeeting();
				}
			} else {
				// TODO disconnect
			}
		}
		
		private function onGuestPolicyResponse(policy:String):void {
			if (policy == UserSession.GUEST_POLICY_ALWAYS_ACCEPT) {
				onGuestAllowed();
			} else if (policy == UserSession.GUEST_POLICY_ALWAYS_DENY) {
				onGuestDenied();
			} else if (policy == UserSession.GUEST_POLICY_ASK_MODERATOR) {
				userUISession.pushPage(PagesENUM.GUEST);
				userUISession.loading = false;
				userSession.guestEntranceSignal.add(onGuestEntranceResponse);
			}
		}
		
		private function onGuestEntranceResponse(allowed:Boolean):void {
			if (allowed) {
				onGuestAllowed();
			} else {
				onGuestDenied();
			}
		}
		
		private function onGuestAllowed():void {
			successJoiningMeeting();
		}
		
		private function onGuestDenied():void {
			userUISession.loading = false;
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_MODERATOR_DENIED);
		}
		
		private function successJoiningMeeting():void {
			// Set up remaining message sender and receivers:
			chatService.setupMessageSenderReceiver();
			presentationService.setupMessageSenderReceiver();
			// set up and connect the remaining connections
			videoConnection.uri = userSession.config.getConfigFor("VideoConfModule").@uri + "/" + conferenceParameters.room;
			//TODO see if videoConnection.successConnected is dispatched when it's connected properly
			videoConnection.connectionSuccessSignal.add(successVideoConnected);
			videoConnection.connectionFailureSignal.add(unsuccessVideoConnected);
			videoConnection.connect();
			userSession.videoConnection = videoConnection;
			voiceConnection.uri = userSession.config.getConfigFor("PhoneModule").@uri;
			userSession.voiceConnection = voiceConnection;
			deskshareConnection.applicationURI = userSession.config.getConfigFor("DeskShareModule").@uri;
			deskshareConnection.room = conferenceParameters.room;
			deskshareConnection.connect();
			userSession.deskshareConnection = deskshareConnection;
			// Query the server for chat, users, and presentation info
			chatService.sendWelcomeMessage();
			chatService.getPublicChatMessages();
			presentationService.getPresentationInfo();
			userSession.userList.allUsersAddedSignal.add(successUsersAdded);
			usersService.queryForParticipants();
			usersService.queryForRecordingStatus();
			userSession.successJoiningMeetingSignal.remove(successJoiningMeeting);
			userSession.failureJoiningMeetingSignal.remove(unsuccessJoiningMeeting);
			//usersService.getRoomLockState();
		}
		
		private function unsuccessJoiningMeeting():void {
			trace(LOG + "unsuccessJoiningMeeting() -- Failed to join the meeting!!!");
			userSession.successJoiningMeetingSignal.remove(successJoiningMeeting);
			userSession.failureJoiningMeetingSignal.remove(unsuccessJoiningMeeting);
		}
		
		protected function successUsersAdded():void {
			userSession.userList.allUsersAddedSignal.remove(successUsersAdded);
			connectingFinishedSignal.dispatch();
		}
		
		private function unsuccessConnected(reason:String):void {
			trace(LOG + "unsuccessConnected()");
			connectingFailedSignal.dispatch("connectionFailed");
			connection.connectionSuccessSignal.remove(successConnected);
			connection.connectionFailureSignal.remove(unsuccessConnected);
		}
		
		private function successVideoConnected():void {
			trace(LOG + "successVideoConnected()");
			videoConnection.connectionSuccessSignal.remove(successVideoConnected);
			videoConnection.connectionFailureSignal.remove(unsuccessVideoConnected);
		}
		
		private function unsuccessVideoConnected(reason:String):void {
			trace(LOG + "unsuccessVideoConnected()");
			videoConnection.connectionFailureSignal.remove(unsuccessVideoConnected);
			videoConnection.connectionSuccessSignal.remove(successVideoConnected);
		}
	}
}
