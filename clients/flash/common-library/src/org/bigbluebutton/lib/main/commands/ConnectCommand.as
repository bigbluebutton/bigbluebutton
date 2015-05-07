package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectCommand extends Command {
		private const LOG:String = "ConnectCommand::";
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
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
		public var usersService:IUsersService;
		
		[Inject]
		public var chatService:IChatMessageService;
		
		[Inject]
		public var presentationService:IPresentationService;
		
		override public function execute():void {
			connection.uri = uri;
			connection.connectionSuccessSignal.add(successConnected);
			connection.connectionFailureSignal.add(unsuccessConnected);
			connection.connect(conferenceParameters);
		}
		
		private function successConnected():void {
			trace(LOG + "successConnected()");
			userSession.mainConnection = connection;
			userSession.userId = connection.userId;
			// Set up users message sender in order to send the "joinMeeting" message:
			usersService.setupMessageSenderReceiver();
			// Send the join meeting message, then wait for the reponse
			userSession.successJoiningMeetingSignal.add(successJoiningMeeting);
			userSession.failureJoiningMeetingSignal.add(unsuccessJoiningMeeting);
			usersService.validateToken();
			connection.connectionSuccessSignal.remove(successConnected);
			connection.connectionFailureSignal.remove(unsuccessConnected);
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
			userUISession.loading = false;
			userSession.userList.allUsersAddedSignal.remove(successUsersAdded);
		}
		
		private function unsuccessConnected(reason:String):void {
			trace(LOG + "unsuccessConnected()");
			userUISession.loading = false;
			userUISession.joinFailureSignal.dispatch("connectionFailed");
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
