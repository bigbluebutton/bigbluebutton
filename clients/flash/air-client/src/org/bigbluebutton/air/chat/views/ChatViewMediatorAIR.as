package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.chat.views.ChatViewMediatorBase;
	import org.bigbluebutton.lib.user.models.User2x;
	
	public class ChatViewMediatorAIR extends ChatViewMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			super.initialize();
			
			var data:Object = uiSession.currentPageDetails;
			
			if (data.publicChat) {
				_user = null;
				_publicChat = true;
				openChat(chatMessagesSession.publicConversation);
			} else {
				var user:User2x = meetingData.users.getUser(data.intId);
				_publicChat = false;
				if (user != null) {
					_user = user;
					openChat(chatMessagesSession.getPrivateMessages(user.intId, user.name));
				}
			}
		}
	}
}
