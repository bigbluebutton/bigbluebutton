package org.bigbluebutton.air.participants.views {
	import mx.graphics.SolidColor;
	
	import spark.components.Group;
	import spark.components.Scroller;
	import spark.components.VGroup;
	import spark.primitives.Rect;
	
	import org.bigbluebutton.air.chat.views.ChatRoomsViewBase;
	import org.bigbluebutton.air.user.views.UsersViewBase;
	
	public class ParticipantsViewBase extends Group {
		
		private var _background:Rect;
		
		public function ParticipantsViewBase() {
			super();
			
			_background = new Rect();
			_background.percentHeight = 100;
			_background.percentWidth = 100;
			_background.fill = new SolidColor();
			addElementAt(_background, 0);
			
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
			usersView.percentHeight = 100;
			group.addElement(usersView);
			
			addElement(scroller);
		}
		
		protected function createChatRoomsView():ChatRoomsViewBase {
			return new ChatRoomsViewBase;
		}
		
		protected function createUsersView():UsersViewBase {
			return new UsersViewBase;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_background.fill).color = getStyle("backgroundColor");
		}
	}
}
