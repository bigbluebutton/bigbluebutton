package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.chat.models.GroupChat;
	import org.bigbluebutton.lib.chat.views.ChatViewMediatorBase;
	import org.bigbluebutton.lib.user.models.User2x;
	
	public class ChatViewMediatorAIR extends ChatViewMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			super.initialize();
			
			var data:Object = uiSession.currentPageDetails;
			
			var chat:GroupChat = chatMessagesSession.getGroupByChatId(data.chatId);
			if (chat) {
				openChat(chat);
			}
		}
	}
}
