package org.bigbluebutton.air.chat.events {
	import flash.events.Event;
	
	import org.bigbluebutton.air.chat.models.GroupChat;
	
	public class ChatRoomItemSelectedEvent extends Event {
		public static var SELECTED:String = "CHAT_ROOM_ITEM_SELECTED_EVENT";
		
		public var chatRoom:GroupChat;
		
		public function ChatRoomItemSelectedEvent(c:GroupChat) {
			super(SELECTED, true, false);
			
			chatRoom = c;
		}
	}
}
