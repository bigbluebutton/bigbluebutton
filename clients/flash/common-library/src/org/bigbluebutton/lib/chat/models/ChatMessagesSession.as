package org.bigbluebutton.lib.chat.models {
	
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ChatMessagesSession implements IChatMessagesSession {
		private var _publicChat:ChatMessages = new ChatMessages();
		
		private var _privateChats:ArrayCollection = new ArrayCollection();
		
		private var _chatMessageChangeSignal:ISignal = new Signal();
		
		public function set publicChat(value:ChatMessages):void {
			_publicChat = value;
		}
		
		public function get publicChat():ChatMessages {
			return _publicChat;
		}
		
		public function get privateChats():ArrayCollection {
			return _privateChats;
		}
		
		/**
		 * Create private chat for the new user
		 *
		 * */
		public function addUserToPrivateMessages(userId:String, userName:String):PrivateChatMessage {
			var pcm:PrivateChatMessage = new PrivateChatMessage();
			pcm.userID = userId;
			pcm.userName = userName;
			_privateChats.addItem(pcm);
			return pcm;
		}
		
		/**
		 * Send private messages to a specific user based on a UserId
		 *
		 * @param UserId
		 * @param newMessage
		 */
		public function newPrivateMessage(userId:String, userName:String, newMessage:ChatMessageVO):void {
			if (_privateChats != null) {
				for each (var privateMessage:PrivateChatMessage in _privateChats) {
					if (privateMessage.userID == userId) {
						privateMessage.privateChat.newChatMessage(newMessage);
						return;
					}
				}
				// if chat wasn't added to _privateChats colletion yet
				var pcm:PrivateChatMessage = addUserToPrivateMessages(userId, userName);
				pcm.privateChat.newChatMessage(newMessage);
				chatMessageDispatchSignal(userId);
			}
		}
		
		/**
		 * Get a private chat messages based on a UserId
		 *
		 * @param UserId
		 */
		public function getPrivateMessages(userId:String, userName:String):PrivateChatMessage {
			if (_privateChats != null) {
				for each (var privateMessage:PrivateChatMessage in _privateChats) {
					if (privateMessage.userID == userId) {
						return privateMessage;
					}
				}
			}
			// if user is not in private messages yet, add one
			return addUserToPrivateMessages(userId, userName);
		}
		
		public function chatMessageDispatchSignal(UserID:String):void {
			if (_chatMessageChangeSignal) {
				_chatMessageChangeSignal.dispatch(UserID);
			}
		}
		
		public function get chatMessageChangeSignal():ISignal {
			return _chatMessageChangeSignal;
		}
		
		public function set chatMessageChangeSignal(signal:ISignal):void {
			_chatMessageChangeSignal = signal;
		}
	}
}
