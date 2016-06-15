package org.bigbluebutton.lib.chat.models {
	
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ChatMessagesSession implements IChatMessagesSession {
		
		private var _chats:ArrayCollection;
		
		[Bindable]
		public function get chats():ArrayCollection {
			return _chats;
		}
		
		public function set chats(val:ArrayCollection):void {
			_chats = val;
		}
		
		public function get publicConversation():Conversation {
			return _chats[0];
		}
		
		public function ChatMessagesSession():void {
			_chats = new ArrayCollection();
			_chats.addItem(new Conversation("", "Public Chat", true));
		}
		
		public function newPublicMessage(newMessage:ChatMessageVO):void {
			publicConversation.newChatMessage(newMessage);
		}
		
		/**
		 * Create private chat for the new user
		 *
		 **/
		public function addUserToPrivateMessages(userId:String, userName:String):Conversation {
			var conv:Conversation = new Conversation(userId, userName, false);
			_chats.addItem(conv);
			
			return conv;
		}
		
		/**
		 * Send private messages to a specific user based on a UserId
		 *
		 * @param UserId
		 * @param newMessage
		 */
		public function newPrivateMessage(userId:String, userName:String, newMessage:ChatMessageVO):void {
			if (_chats != null) {
				for each (var conv:Conversation in _chats) {
					if (conv.userId == userId) {
						conv.newChatMessage(newMessage);
						return;
					}
				}
				// if chat wasn't added to _privateChats colletion yet
				var newConv:Conversation = addUserToPrivateMessages(userId, userName);
				newConv.newChatMessage(newMessage);
			}
		}
		
		/**
		 * Get a private chat messages based on a UserId
		 *
		 * @param UserId
		 */
		public function getPrivateMessages(userId:String, userName:String):Conversation {
			if (_chats != null) {
				for each (var conv:Conversation in _chats) {
					if (conv.userId == userId) {
						return conv;
					}
				}
			}
			// if user is not in private messages yet, add one
			return addUserToPrivateMessages(userId, userName);
		}
	}
}
