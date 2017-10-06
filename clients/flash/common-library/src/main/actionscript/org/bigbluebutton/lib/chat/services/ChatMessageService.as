package org.bigbluebutton.lib.chat.services {
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ChatMessageService implements IChatMessageService {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		public var chatMessageSender:ChatMessageSender;
		
		public var chatMessageReceiver:ChatMessageReceiver;
		
		private var _sendMessageOnSuccessSignal:ISignal = new Signal();
		
		private var _sendMessageOnFailureSignal:ISignal = new Signal();
		
		public function get sendMessageOnSuccessSignal():ISignal {
			return _sendMessageOnSuccessSignal;
		}
		
		public function get sendMessageOnFailureSignal():ISignal {
			return _sendMessageOnFailureSignal;
		}
		
		public function ChatMessageService() {
		}
		
		public function setupMessageSenderReceiver():void {
			chatMessageSender = new ChatMessageSender(userSession, conferenceParameters, _sendMessageOnSuccessSignal, _sendMessageOnFailureSignal);
			chatMessageReceiver = new ChatMessageReceiver(userSession, conferenceParameters, chatMessagesSession);
			userSession.mainConnection.addMessageListener(chatMessageReceiver);
		}
		
		public function getPublicChatMessages():void {
			chatMessageSender.getPublicChatMessages();
		}
		
		public function sendPublicMessage(message:ChatMessageVO):void {
			chatMessageSender.sendPublicMessage(message);
		}
		
		public function sendPrivateMessage(message:ChatMessageVO):void {
			chatMessageSender.sendPrivateMessage(message);
		}
		
		/**
		 * Creates new instance of ChatMessageVO with Welcome message as message string
		 * and imitates new public message being sent
		 **/
		public function sendWelcomeMessage():void {
			// retrieve welcome message from conference parameters
			var welcome:String = conferenceParameters.welcome;
			if (welcome != "") {
				var msg:ChatMessageVO = new ChatMessageVO();
				msg.fromUserId = " ";
				msg.fromUsername = " ";
				msg.fromColor = "86187";
				msg.fromTime = new Date().time;
				msg.fromTimezoneOffset = new Date().timezoneOffset;
				msg.toUserId = " ";
				msg.toUsername = " ";
				msg.message = welcome;
				// imitate new public message being sent
				chatMessagesSession.newPublicMessage(msg);
			}
		}
	}
}
