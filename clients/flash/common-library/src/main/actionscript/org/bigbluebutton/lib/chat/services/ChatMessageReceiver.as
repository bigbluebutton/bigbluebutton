package org.bigbluebutton.lib.chat.services {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class ChatMessageReceiver implements IMessageListener {
		private const LOG:String = "ChatMessageReceiver::";
		
		private var userSession:IUserSession;
		
		private var conferenceParameters:IConferenceParameters;
		
		private var chatMessagesSession:IChatMessagesSession;
		
		public function ChatMessageReceiver(userSession:IUserSession, conferenceParameters:IConferenceParameters, chatMessagesSession:IChatMessagesSession) {
			this.userSession = userSession;
			this.conferenceParameters = conferenceParameters;
			this.chatMessagesSession = chatMessagesSession;
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "GetChatHistoryRespMsg":
					handleGetChatHistoryRespMsg(message);
					break;
				case "SendPublicMessageEvtMsg":
					handleSendPublicMessageEvtMsg(message);
					break;
				case "ClearPublicChatHistoryEvtMsg":
					handleClearPublicChatHistoryEvtMsg(message);
					break;
				default:
					//   LogUtil.warn("Cannot handle message [" + messageName + "]");
			}
		}
		
		private function handleGetChatHistoryRespMsg(msg:Object):void {
			trace(LOG + "Received [GetChatHistoryRespMsg] from server.");
			var messages:Array = msg.body.history as Array;
			var msgCount:Number = messages.length;
			
			chatMessagesSession.publicConversation.messages = new ArrayCollection();
			chatMessagesSession.publicConversation.newMessages = 0; //resetNewMessages();
			for (var i:int = 0; i < msgCount; i++) {
				var cm:ChatMessageVO = processIncomingChatMessage(messages[i]);
				chatMessagesSession.newPublicMessage(cm);
			}
			userSession.loadedMessageHistorySignal.dispatch();
		}
		
		private function handleSendPublicMessageEvtMsg(msg:Object):void {
			trace(LOG + "Received [SendPublicMessageEvtMsg] from server.");
			var cm:ChatMessageVO = processIncomingChatMessage(msg.body.message);
			
			chatMessagesSession.newPublicMessage(cm);
		}
		
		private function handleClearPublicChatHistoryEvtMsg(message:Object):void {
			trace(LOG + "Received [ClearPublicChatHistoryEvtMsg] from server.");
			trace("ClearPublicChatHistoryEvtMsg isn't being handled yet");
		}
		
		private function processIncomingChatMessage(rawMessage:Object):ChatMessageVO {
			var msg:ChatMessageVO = new ChatMessageVO();
			msg.fromUserId = rawMessage.fromUserId;
			msg.fromUsername = rawMessage.fromUsername;
			msg.fromColor = rawMessage.fromColor;
			msg.fromTime = rawMessage.fromTime;
			msg.message = rawMessage.message;
			return msg;
		}
	}
}
