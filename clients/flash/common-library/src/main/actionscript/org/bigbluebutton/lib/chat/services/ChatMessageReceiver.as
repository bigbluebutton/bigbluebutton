package org.bigbluebutton.lib.chat.services {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class ChatMessageReceiver implements IMessageListener {
		public var userSession:IUserSession;
		
		public var chatMessagesSession:IChatMessagesSession;
		
		public function ChatMessageReceiver(userSession:IUserSession, chatMessagesSession:IChatMessagesSession) {
			this.userSession = userSession;
			this.chatMessagesSession = chatMessagesSession;
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "ChatReceivePublicMessageCommand":
					handleChatReceivePublicMessageCommand(message);
					break;
				case "ChatReceivePrivateMessageCommand":
					handleChatReceivePrivateMessageCommand(message);
					break;
				case "ChatRequestMessageHistoryReply":
					handleChatRequestMessageHistoryReply(message);
					break;
				default:
					//   LogUtil.warn("Cannot handle message [" + messageName + "]");
			}
		}
		
		private function handleChatRequestMessageHistoryReply(message:Object):void {
			var messages:Array = JSON.parse(message.msg as String) as Array;
			var msgCount:Number = messages.length;
			chatMessagesSession.publicConversation.messages = new ArrayCollection();
			chatMessagesSession.publicConversation.newMessages = 0; //resetNewMessages();
			for (var i:int = 0; i < msgCount; i++) {
				handleChatReceivePublicMessageCommand(messages[i]);
			}
			userSession.loadedMessageHistorySignal.dispatch();
		}
		
		private function handleChatReceivePublicMessageCommand(message:Object):void {
			trace("Handling public chat message [" + message.message + "]");
			var msg:ChatMessageVO = new ChatMessageVO();
			msg.chatType = message.chatType;
			msg.fromUserID = message.fromUserID;
			msg.fromUsername = message.fromUsername;
			msg.fromColor = message.fromColor;
			msg.fromLang = message.fromLang;
			msg.fromTime = message.fromTime;
			msg.fromTimezoneOffset = message.fromTimezoneOffset;
			msg.toUserID = message.toUserID;
			msg.toUsername = message.toUsername;
			msg.message = message.message;
			chatMessagesSession.newPublicMessage(msg);
		}
		
		private function handleChatReceivePrivateMessageCommand(message:Object):void {
			trace("Handling private chat message");
			var msg:ChatMessageVO = new ChatMessageVO();
			msg.chatType = message.chatType;
			msg.fromUserID = message.fromUserID;
			msg.fromUsername = message.fromUsername;
			msg.fromColor = message.fromColor;
			msg.fromLang = message.fromLang;
			msg.fromTime = message.fromTime;
			msg.fromTimezoneOffset = message.fromTimezoneOffset;
			msg.toUserID = message.toUserID;
			msg.toUsername = message.toUsername;
			msg.message = message.message;
			var userId:String = (msg.fromUserID == userSession.userId ? msg.toUserID : msg.fromUserID);
			var userName:String = (msg.fromUserID == userSession.userId ? msg.toUsername : msg.fromUsername);
			chatMessagesSession.newPrivateMessage(userId, userName, msg);
		}
	}
}
