package org.bigbluebutton.web.chat.views {
	import org.bigbluebutton.lib.chat.views.ChatRoomsMediatorBase;
	import org.bigbluebutton.web.chat.models.ChatRoomVO;
	import org.bigbluebutton.web.main.models.IUISession;
	
	import spark.events.IndexChangeEvent;
	
	public class ChatRoomsMediatorWeb extends ChatRoomsMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			super.initialize();
			
			uiSession.chatInfoSignal.add(onChatInfoSignal);
		}
		
		private function onChatInfoSignal():void {
			if (uiSession.chatInfo == null) {
				view.chatRoomList.selectedIndex = -1;
			} else if (uiSession.chatInfo.publicChat) {
				view.chatRoomList.selectedIndex = 0;
			} else {
				// loop through and find the chat entry
				for (var i:int = 1; i < dataProvider.length; i++) {
					if (dataProvider[i].userId == uiSession.chatInfo.userId) {
						view.chatRoomList.selectedIndex = i;
						return;
					}
				}
				// if no entry found set to -1
				view.chatRoomList.selectedIndex = -1;
			}
		}
		
		override protected function onListIndexChangeEvent(e:IndexChangeEvent):void {
			var item:Object = dataProvider.getItemAt(e.newIndex);
			
			uiSession.chatInfo = new ChatRoomVO(item.userId, item.isPublic);
		}
		
		override public function destroy():void {
			uiSession.chatInfoSignal.remove(onChatInfoSignal);
			
			super.destroy();
		}
	}
}
