package org.bigbluebutton.air.participants.models {
	import mx.collections.ArrayCollection;
	import mx.collections.IList;
	import mx.collections.Sort;
	
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.user.models.UserRole;
	import org.bigbluebutton.air.user.views.models.UserVM;
	
	public class ParticipantsCollection extends ArrayCollection {
		public function ParticipantsCollection():void {
			addItem(new ParticipantTitle("Conversations", ParticipantTitle.CHAT));
			addItem(new ParticipantTitle("Online", ParticipantTitle.USER));
			sort = new Sort(null, sortFunc);
		}
		
		public function initGroupChats(groupChats:IList):void {
			addAllAt(groupChats, 1);
		}
		
		public function addGroupChat(groupChat:GroupChat):void {
			addItem(groupChat);
		}
		
		public function initUsers(users:IList):void {
			addAll(users);
		}
		
		public function addUser(user:UserVM):void {
			addItem(user);
		}
		
		public function removeUser(user:UserVM):void {
			removeItem(user);
		}
		
		/**
		 * This sortFuc sorts the mixed collection of UserVMs, ParticipantTitles, and GroupChats. The required order 
		 * is very specific and the sort function is carefully crafted to match. DON'T CHANGE UNLESS YOU KNOW WHAT 
		 * YOU'RE DOING. Even if you think you know what you're doing ask Chad first to verify.
		 */
		private function sortFunc(a:Object, b:Object, fields:Array = null):int {
			if (a is UserVM && b is UserVM) {
				return sortUsers(a as UserVM, b as UserVM);
			} else if (a is UserVM) {
				return 1;
			} else if (b is UserVM) {
				return -1;
			} else if (a is ParticipantTitle) {
				return a.type - 1;
			} else if (b is ParticipantTitle) {
				return -(b.type - 1);
			} else {
				return sortChat(a as GroupChat, b as GroupChat);
			}
		}
		
		private function sortChat(a:GroupChat, b:GroupChat):int {
			if (a.isPublic && !b.isPublic)
				return -1;
			else if (!a.isPublic > b.isPublic)
				return 1;
			else {
				var ag:GroupChat = a as GroupChat, bg:GroupChat = b as GroupChat;
				if (ag.name.toLowerCase() < bg.name.toLowerCase())
					return -1;
				else
					return 1;
			}
		}
		
		private function sortUsers(a:UserVM, b:UserVM):int {
			if (a.role == UserRole.MODERATOR && b.role == UserRole.MODERATOR) {
				if (a.hasEmojiStatus && b.hasEmojiStatus) {
					if (a.emojiStatusTime < b.emojiStatusTime)
						return -1;
					else
						return 1;
				} else if (a.hasEmojiStatus)
					return -1;
				else if (b.hasEmojiStatus)
					return 1;
			} else if (a.role == UserRole.MODERATOR)
				return -1;
			else if (b.role == UserRole.MODERATOR)
				return 1;
			else if (a.hasEmojiStatus && b.hasEmojiStatus) {
				if (a.emojiStatusTime < b.emojiStatusTime)
					return -1;
				else
					return 1;
			} else if (a.hasEmojiStatus)
				return -1;
			else if (b.hasEmojiStatus)
				return 1;
			else if (!a.voiceOnly && !b.voiceOnly) {
			} else if (!a.voiceOnly)
				return -1;
			else if (!b.voiceOnly)
				return 1;
			/*
			 * Check name (case-insensitive) in the event of a tie up above. If the name
			 * is the same then use intId which should be unique making the order the same
			 * across all clients.
			 */
			if (a.name.toLowerCase() < b.name.toLowerCase())
				return -1;
			else if (a.name.toLowerCase() > b.name.toLowerCase())
				return 1;
			else if (a.intId.toLowerCase() > b.intId.toLowerCase())
				return -1;
			else if (a.intId.toLowerCase() < b.intId.toLowerCase())
				return 1
			else
				return 0;
		}
	}
}
