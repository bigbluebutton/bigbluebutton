package org.bigbluebutton.lib.participants.views {
	import org.bigbluebutton.lib.chat.views.ChatRoomsViewBase;
	import org.bigbluebutton.lib.user.views.UsersViewBase;
	
	import spark.components.Group;
	import spark.components.Scroller;
	import spark.components.VGroup;
	
	public class ParticipantsViewBase extends Group {
		public function ParticipantsViewBase() {
			super();
			
			var scroller:Scroller = new Scroller;
			scroller.percentHeight = 100;
			scroller.percentWidth = 100;
			
			var group:VGroup = new VGroup();
			group.percentWidth = 100;
			group.percentHeight = 100;
			scroller.viewport = group;
			
			var chatRoomsView:ChatRoomsViewBase = createChatRoomsView();
			chatRoomsView.percentWidth = 100;
			group.addElement(chatRoomsView);
			
			var usersView:UsersViewBase = createUsersView();
			usersView.percentWidth = 100;
			group.addElement(usersView);
			
			addElement(scroller);
		}
		
		protected function createChatRoomsView():ChatRoomsViewBase {
			return new ChatRoomsViewBase;
		}
		
		protected function createUsersView():UsersViewBase {
			return new UsersViewBase;
		}
	}
}