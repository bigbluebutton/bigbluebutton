package org.bigbluebutton.web.chat.views {
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatWindowMediator extends Mediator {
		
		[Inject]
		public var view:ChatWindow;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		override public function initialize():void {
			view.chatMessageList.dataProvider = chatMessagesSession.publicChat.messages;
		}
		
		override public function destroy():void {
			super.destroy();
			//view.dispose();
			view = null;
		}
	}
}
