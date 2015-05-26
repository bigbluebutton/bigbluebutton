package org.bigbluebutton.web.chat.views {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.PrivateChatMessage;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatWindowMediator extends Mediator {
		
		[Inject]
		public var view:ChatWindow;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			addChatView(null, "Public", chatMessagesSession.publicChat.messages);
			
			chatMessagesSession.chatMessageChangeSignal.add(newMessageReceived);
		}
		
		private function newMessageReceived(userID:String):void {
			var user:User = userSession.userList.getUser(userID);
			var pcm:PrivateChatMessage = chatMessagesSession.getPrivateMessages(user.userID, user.name);
			if (pcm.privateChat.messages.length > 0 && view.findChatView(user.userID) == null) {
				addChatView(user.userID, user.name, pcm.privateChat.messages);
			}
		}
		
		private function addChatView(userID:String, userName:String, messages:ArrayCollection):void {
			var chatView:ChatView = new ChatView();
			chatView.label = userName;
			chatView.userID = userID;
			chatView.messageList.dataProvider = messages;
			view.addView(chatView);
		}
		
		override public function destroy():void {
			super.destroy();
			//view.dispose();
			chatMessagesSession.chatMessageChangeSignal.remove(newMessageReceived);
			view = null;
		}
	}
}
