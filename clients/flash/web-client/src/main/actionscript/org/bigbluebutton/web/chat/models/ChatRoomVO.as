package org.bigbluebutton.web.chat.models {
	
	public class ChatRoomVO {
		public var userId:String;
		
		public var publicChat:Boolean;
		
		public function ChatRoomVO(userId:String, publicChat:Boolean) {
			this.userId = userId;
			this.publicChat = publicChat;
		}
	}
}
