package org.bigbluebutton.air.participants.models {
	import mx.collections.ArrayCollection;
	import mx.collections.IList;
	
	import org.bigbluebutton.air.chat.models.GroupChatVO;
	import org.bigbluebutton.air.user.views.models.UserVM;
	
	public class ParticipantsCollection extends ArrayCollection {
		private var chatsTitleIndex:int = 0;
		
		private var usersTitleIndex:int = 1;
		
		public function ParticipantsCollection():void {
			addItem(new ParticipantTitle("Conversations"));
			addItem(new ParticipantTitle("Online"));
		}
		
		public function initGroupChats(groupChats:IList):void {
			addAllAt(groupChats, 1);
			usersTitleIndex += groupChats.length;
		}
		
		
		public function addGroupChat(groupChat:GroupChatVO, originalIndex:int):void {
			addItemAt(groupChat, originalIndex + 1);
			usersTitleIndex++;
		}
		
		public function initUsers(users:IList):void {
			addAllAt(users, usersTitleIndex + 1);
		}
		
		public function addUser(user:UserVM, originalIndex:int):void {
			addItemAt(user, usersTitleIndex + originalIndex + 1);
		}
		
		public function removeUser(user:UserVM):void {
			removeItem(user);
		}
	}
}
