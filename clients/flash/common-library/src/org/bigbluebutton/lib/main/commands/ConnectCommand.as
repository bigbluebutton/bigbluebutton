package org.bigbluebutton.lib.main.commands {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.Room;
	import org.bigbluebutton.lib.main.models.UserSession;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
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
		public var guestWaitingForApprovalSignal:GuestWaitingForApprovalSignal;
		
		[Inject]
		public var connectingFailedSignal:ConnectingFailedSignal;
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var saveData:ISaveData;
		
		override public function execute():void {
			loadConfigOptions();
			connection.uri = uri;
			connection.connectionSuccessSignal.add(successConnected);
			connection.connectionFailureSignal.add(unsuccessConnected);
			connection.connect(conferenceParameters);
		}
		
		private function loadConfigOptions():void {
			userSession.phoneOptions = new PhoneOptions(userSession.config.getConfigFor("PhoneModule"));
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
				guestWaitingForApprovalSignal.dispatch();
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
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_MODERATOR_DENIED);
		}
		
		private function successJoiningMeeting():void {
			updateRooms();
			// Set up remaining message sender and receivers:
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
			
			var audioOptions:Object = new Object();
			if (userSession.phoneOptions.autoJoin && userSession.phoneOptions.skipCheck) {
				var forceListenOnly:Boolean = (userSession.config.getConfigFor("PhoneModule").@forceListenOnly.toString().toUpperCase() == "TRUE") ? true : false;
				audioOptions.shareMic = userSession.userList.me.voiceJoined = !forceListenOnly;
				audioOptions.listenOnly = userSession.userList.me.listenOnly = forceListenOnly;
				shareMicrophoneSignal.dispatch(audioOptions);
			} else {
				audioOptions.shareMic = userSession.userList.me.voiceJoined = false;
				audioOptions.listenOnly = userSession.userList.me.listenOnly = true;
				shareMicrophoneSignal.dispatch(audioOptions);
			}
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
		
		private function updateRooms():void {
			var rooms:ArrayCollection = saveData.read("rooms") as ArrayCollection;
			if (!rooms) {
				rooms = new ArrayCollection();
			}
			var roomName:String = conferenceParameters.meetingName;
			var roomUrl:String = (conferenceParameters.metadata && conferenceParameters.metadata.hasOwnProperty("invitation-url")) ? conferenceParameters.metadata['invitation-url'] : null;
			if (roomName) {
				var roomExists:Boolean = false;
				for (var i:int = rooms.length - 1; i >= 0; i--) {
					if (rooms[i].name == roomName && rooms[i].url == roomUrl) {
						rooms[i].timestamp = new Date();
						rooms.addItem(rooms.removeItemAt(i));
						roomExists = true;
						break;
					}
				}
				if (!roomExists) {
					var room:Room = new Room(new Date(), roomUrl, roomName);
					rooms.addItem(room);
					if (rooms.length > 5) {
						rooms.removeItemAt(0);
					}
				}
				saveData.save("rooms", rooms);
			}
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
			if (userSession.videoAutoStart && userSession.skipCamSettingsCheck) {
				shareCameraSignal.dispatch(!userSession.userList.me.hasStream, userSession.videoConnection.cameraPosition);
			}
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
