package org.bigbluebutton.lib.chat.services {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.GroupChatUser;
	import org.bigbluebutton.lib.chat.models.GroupChatVO;
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
				case "GetGroupChatsRespMsg":
					handleGetGroupChatsRespMsg(message);
					break;
				case "GetGroupChatMsgsRespMsg":
					handleGetGroupChatMsgsRespMsg(message);
					break;
				case "ClearPublicChatHistoryEvtMsg":
					handleClearPublicChatHistoryEvtMsg(message);
					break;
				case "GroupChatMessageBroadcastEvtMsg":
					handleGroupChatMessageBroadcastEvtMsg(message);
					break;
				case "GroupChatCreatedEvtMsg":
					handleGroupChatCreatedEvtMsg(message);
					break;
				default:
					//   LogUtil.warn("Cannot handle message [" + messageName + "]");
			}
		}
		
		private function handleGetGroupChatsRespMsg(msg:Object):void {
			var body:Object = msg.body as Object;
			var allChats:Array = msg.body.chats as Array;
			
			var chats:Array = new Array();
			if (allChats.length > 0) {
				for (var i:int = 0; i < allChats.length; i++) {
					var groupChat:GroupChatVO = processGroupChat(allChats[i]);
					chats.push(groupChat);
				}
			}
			
			chatMessagesSession.addGroupChatsList(chats);
		}
		
		private function handleGetGroupChatMsgsRespMsg(msg:Object):void {
			trace(LOG + "Received [GetGroupChatMsgsRespMsg] from server.");
			var chatId:String = msg.body.chatId as String;
			var messages:Array = msg.body.msgs as Array;
			var msgCount:Number = messages.length;
			var processedMessages:Array = new Array();
			
			for (var i:int = 0; i < msgCount; i++) {
				var cm:ChatMessageVO = processChatMessage(messages[i]);
				processedMessages.push(cm);
			}
			
			chatMessagesSession.addMessageHistory(chatId, processedMessages);
		}
		
		private function handleClearPublicChatHistoryEvtMsg(message:Object):void {
			trace(LOG + "Received [ClearPublicChatHistoryEvtMsg] from server.");
			chatMessagesSession.clearPublicChat(message.body.chatId);
		}
		
		private function handleGroupChatMessageBroadcastEvtMsg(msg:Object):void {
			trace(LOG + "Received [GroupChatMessageBroadcastEvtMsg] from server.");
			var chatId:String = msg.body.chatId as String;
			var cm:ChatMessageVO = processChatMessage(msg.body.msg);
			
			chatMessagesSession.addChatMessage(chatId, cm);
		}
		
		private function handleGroupChatCreatedEvtMsg(msg:Object):void {
			var groupChat:GroupChatVO = processGroupChat(msg.body);
			chatMessagesSession.addGroupChat(groupChat);
		}
		
		private function processGroupChat(rawGroupChat:Object):GroupChatVO {
			var gc:GroupChatVO = new GroupChatVO();
			gc.id = rawGroupChat.hasOwnProperty("chatId") ? rawGroupChat.chatId : rawGroupChat.id;
			gc.name = rawGroupChat.name as String;
			gc.access = rawGroupChat.access as String;
			gc.createdBy = new GroupChatUser(rawGroupChat.createdBy.id as String, rawGroupChat.createdBy.name as String);
			var users:Array = rawGroupChat.users as Array;
			
			var chatUsers:Array = new Array();
			if (users.length > 0) {
				for (var i:int = 0; i < users.length; i++) {
					var u:Object = users[i] as Object;
					chatUsers.push(new GroupChatUser(u.id, u.name));
				}
			}
			
			gc.users = chatUsers;
			
			return gc;
		}
		
		private function processChatMessage(rawMessage:Object):ChatMessageVO {
			var msg:ChatMessageVO = new ChatMessageVO();
			msg.fromUserId = rawMessage.sender.id;
			msg.fromUsername = rawMessage.sender.name;
			msg.fromColor = rawMessage.color;
			msg.fromTime = rawMessage.timestamp;
			msg.message = rawMessage.message;
			return msg;
		}
	}
}
