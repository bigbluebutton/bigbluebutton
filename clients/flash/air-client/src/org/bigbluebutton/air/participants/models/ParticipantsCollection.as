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
			sort = new Sort(null, sortFunction);
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
		 * Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
		 */
		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			if (a is ParticipantTitle && b is ParticipantTitle) {
				var ap:ParticipantTitle = a as ParticipantTitle, bp:ParticipantTitle = b as ParticipantTitle;
				if (ap.type.toLowerCase() < bp.type.toLowerCase())
					return -1;
				else if (ap.type.toLowerCase() > bp.type.toLowerCase())
					return 1;
			} else if (a is ParticipantTitle && b is GroupChat) {
				var pg:ParticipantTitle = a as ParticipantTitle;
				if (pg.type == ParticipantTitle.CHAT) {
					return -1;
				} else if (pg.type == ParticipantTitle.USER) {
					return 1;
				}
			} else if ((a is ParticipantTitle || b is GroupChat) && b is UserVM) {
				// ParticipantTitle and GroupChat are always before UserVM
				return -1;
			} else if (a is UserVM && (b is ParticipantTitle || b is GroupChat)) {
				// UserVM is always after ParticipantTitle and GroupChat
				return 1;
			} else if (a is GroupChat && b is ParticipantTitle) {
				var gp:ParticipantTitle = b as ParticipantTitle;
				if (gp.type == ParticipantTitle.CHAT) {
					return 1;
				} else if (gp.type == ParticipantTitle.USER) {
					return -1;
				}
			} else if (a is GroupChat && b is GroupChat) {
				if (a.isPublic && !b.isPublic)
					return -1;
				else if (!a.isPublic > b.isPublic)
					return 1;
				else if (a.isPublic == b.isPublic) {
					var ag:GroupChat = a as GroupChat, bg:GroupChat = b as GroupChat;
					if (ag.name.toLowerCase() < bg.name.toLowerCase())
						return -1;
					else if (ag.name.toLowerCase() > bg.name.toLowerCase())
						return 1;
				}
			} else if (a is UserVM && b is UserVM) {
				/**
				 * Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
				 */
				var au:UserVM = a as UserVM, bu:UserVM = b as UserVM;
				if (au.role == UserRole.MODERATOR && bu.role == UserRole.MODERATOR) {
					if (au.hasEmojiStatus && bu.hasEmojiStatus) {
						if (au.emojiStatusTime < bu.emojiStatusTime)
							return -1;
						else
							return 1;
					} else if (au.hasEmojiStatus)
						return -1;
					else if (bu.hasEmojiStatus)
						return 1;
				} else if (au.role == UserRole.MODERATOR)
					return -1;
				else if (bu.role == UserRole.MODERATOR)
					return 1;
				else if (au.hasEmojiStatus && bu.hasEmojiStatus) {
					if (au.emojiStatusTime < bu.emojiStatusTime)
						return -1;
					else
						return 1;
				} else if (au.hasEmojiStatus)
					return -1;
				else if (bu.hasEmojiStatus)
					return 1;
				else if (!au.voiceOnly && !bu.voiceOnly) {
				} else if (!au.voiceOnly)
					return -1;
				else if (!bu.voiceOnly)
					return 1;
				/*
				 * Check name (case-insensitive) in the event of a tie up above. If the name
				 * is the same then use userID which should be unique making the order the same
				 * across all clients.
				 */
				if (au.name.toLowerCase() < bu.name.toLowerCase())
					return -1;
				else if (au.name.toLowerCase() > bu.name.toLowerCase())
					return 1;
				else if (au.intId.toLowerCase() > bu.intId.toLowerCase())
					return -1;
				else if (au.intId.toLowerCase() < bu.intId.toLowerCase())
					return 1
			}
			return 0;
		}
	}
}
