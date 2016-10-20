package org.bigbluebutton.web.chat.views {
	import org.bigbluebutton.lib.chat.views.ChatViewMediatorBase;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.web.main.models.IUISession;
	
	public class ChatViewMediatorWeb extends ChatViewMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			super.initialize();
			
			uiSession.chatInfoSignal.add(onChatInfoSignal);
		}
		
		private function onChatInfoSignal():void {
			if (uiSession.chatInfo != null) {
				if (uiSession.chatInfo.publicChat) {
					_user = null;
					_publicChat = true;
					openChat(chatMessagesSession.publicConversation);
				} else {
					var user:User = userSession.userList.getUserByUserId(uiSession.chatInfo.userId);
					_publicChat = false;
					if (user != null) {
						_user = user;
						openChat(chatMessagesSession.getPrivateMessages(user.userId, user.name));
					}
				}
			}
		}
		
		override public function destroy():void {
			uiSession.chatInfoSignal.remove(onChatInfoSignal);
			
			super.destroy();
		}
	}
}
