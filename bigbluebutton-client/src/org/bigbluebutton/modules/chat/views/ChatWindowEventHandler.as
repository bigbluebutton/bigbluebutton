package org.bigbluebutton.modules.chat.views {
	import mx.collections.ArrayCollection;
	import mx.collections.Sort;

	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.core.model.users.User2x;
	import org.bigbluebutton.main.events.UserJoinedEvent;
	import org.bigbluebutton.modules.chat.model.ChatModel;
	import org.bigbluebutton.modules.chat.model.GroupChat;
	import org.bigbluebutton.modules.chat.views.model.ChatUser;
	import org.bigbluebutton.modules.chat.views.model.GroupChatData;

	public class ChatWindowEventHandler {

		[Bindable]
		public var users:ArrayCollection = new ArrayCollection();

		[Bindable]
		public var groupChats:ArrayCollection = new ArrayCollection();

		private var sort:Sort;

		public function ChatWindowEventHandler() {
			sort = new Sort();
			sort.compareFunction = sortFunction;
			users.sort = sort;
			users.refresh();
			groupChats.refresh();
		}

		public function populateAllUsers():void {
			getAllWebUsers();
		}

		public function populateAllGroupChats():void {
			getAllGroupChats();
		}

		private function getAllWebUsers():void {
			var userIds:Array = LiveMeeting.inst().users.getUserIds();

			for (var i:int = 0; i < userIds.length; i++) {
				var userId:String = userIds[i] as String;
				var user:User2x = UsersUtil.getUser2x(userId);
				addUser(users, user);
			}

			users.refresh();
		}

		public function handleUserJoinedEvent(event:UserJoinedEvent):void {
			var user:User2x = UsersUtil.getUser(event.userID);
			if (user != null) {
				addUser(users, user);
				users.refresh();
			}
		}

		private function addUser(users:ArrayCollection, user:User2x):void {
			var buser:ChatUser = new ChatUser();
			buser.userId = user.intId;
			buser.name = user.name;

			// We want to remove the user if it's already in the collection and re-add it.
			removeUser(user.intId, users);

			users.addItem(buser);
		}

		private function addGroupChat(groupChats:ArrayCollection, groupChat:GroupChat):void {
			var chatData:GroupChatData = new GroupChatData();
			chatData.chatId = groupChat.id;
			chatData.name = groupChat.getNameAsUsers(UsersUtil.getMyUserID());

			// We want to remove the group chat if it's already in the collection and re-add it.
			removeGroupChat(groupChat.id, groupChats);

			groupChats.addItem(chatData);
		}

		private function removeUser(userId:String, users:ArrayCollection):void {
			for (var i:int = 0; i < users.length; i++) {
				var user:ChatUser = users.getItemAt(i) as ChatUser;
				if (user.userId == userId) {
					users.removeItemAt(i);
					users.refresh();
					return;
				}
			}
		}

		private function removeGroupChat(chatId:String, groupChats:ArrayCollection):void {
			for (var i:int = 0; i < groupChats.length; i++) {
				var groupChat:GroupChatData = groupChats.getItemAt(i) as GroupChatData;
				if (groupChat.chatId == chatId) {
					groupChats.removeItemAt(i);
					groupChats.refresh();
					return;
				}
			}
		}

		public function handleUserLeftEvent(userId:String):void {
			removeUser(userId, users);
		}

		public function getAllGroupChats():void {
			var chatIds:Array = LiveMeeting.inst().chats.getGroupChatIds();

			for (var i:int = 0; i < chatIds.length; i++) {
				var chatId:String = chatIds[i] as String;
				if (chatId != ChatModel.MAIN_PUBLIC_CHAT) {
					var groupChat:GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
					addGroupChat(groupChats, groupChat);
				}
			}

			groupChats.refresh();
		}

		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			/*
			 * Check name (case-insensitive) in the event of a tie up above. If the name
			 * is the same then use userID which should be unique making the order the same
			 * across all clients.
			 */
			if (a.name.toLowerCase() < b.name.toLowerCase())
				return -1;
			else if (a.name.toLowerCase() > b.name.toLowerCase())
				return 1;
			else if (a.userId.toLowerCase() > b.userId.toLowerCase())
				return -1;
			else if (a.userId.toLowerCase() < b.userId.toLowerCase())
				return 1;
			return 0;
		}

	}
}

