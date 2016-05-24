package org.bigbluebutton.web.chat.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatPanelMediator extends Mediator {
		
		[Inject]
		public var view:ChatPanel;
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			uiSession.chatInfoSignal.add(onChatInfoSignal);
			
			view.closeButton.addEventListener(MouseEvent.CLICK, onCloseButtonClick);
		}
		
		private function onChatInfoSignal():void {
			if (uiSession.chatInfo != null) {
				if (uiSession.chatInfo.publicChat) {
					view.title.text = "Public Chat";
				} else {
					var user:User = userSession.userList.getUserByUserId(uiSession.chatInfo.userId);
					if (user != null) {
						view.title.text = user.name;
					}
				}
			}
		}
		
		private function onCloseButtonClick(e:MouseEvent):void {
			uiSession.chatInfo = null;
		}
		
		override public function destroy():void {
			uiSession.chatInfoSignal.remove(onChatInfoSignal);
			
			view.closeButton.removeEventListener(MouseEvent.CLICK, onCloseButtonClick);
			
			super.destroy();
			view = null;
		}
	}
}
