package org.bigbluebutton.air.chat.views.chatrooms {
	
	import spark.components.List;
	
	public class ChatRoomsView extends ChatRoomsViewBase implements IChatRoomsView {
		
		public function get list():List {
			return chatroomslist;
		}
		
		public function dispose():void {
		}
	}
}
