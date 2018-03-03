package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.main.models.IUISession;
	
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
