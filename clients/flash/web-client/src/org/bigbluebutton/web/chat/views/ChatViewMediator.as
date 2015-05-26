package org.bigbluebutton.web.chat.views {
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.ui.Keyboard;
	
	import mx.events.FlexEvent;
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatViewMediator extends Mediator {
		[Inject]
		public var view:ChatView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var chatMessageService:IChatMessageService;
		
		private var publicChat:Boolean;
		
		override public function initialize():void {
			publicChat = view.userID == null;
			
			chatMessageService.sendMessageOnSuccessSignal.add(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.add(onSendFailure);
			
			view.messageList.addEventListener(FlexEvent.UPDATE_COMPLETE, listUpdateCompleteHandler);
			view.sendButton.addEventListener(MouseEvent.CLICK, sendButtonClickHandler);
			view.inputArea.addEventListener(KeyboardEvent.KEY_DOWN, inputAreaKeyDownHandler);
			
			userSession.userList.userRemovedSignal.add(userRemoved);
			userSession.userList.userAddedSignal.add(userAdded);
		}
		
		protected function userRemoved(userID:String):void {
			if (view != null && view.userID == userID) {
				view.inputArea.enabled = false;
			}
		}
		
		protected function userAdded(newuser:User):void {
			if ((view != null) && (view.userID == newuser.userID)) {
				view.inputArea.enabled = true;
			}
		}
		
		private function sendButtonClickHandler(e:MouseEvent):void {
			createChatMessage();
		}
		
		private function inputAreaKeyDownHandler(e:KeyboardEvent):void {
			if (e.keyCode == Keyboard.ENTER && !e.shiftKey) {
				createChatMessage();
			}
		}
		
		private function createChatMessage():void {
			view.inputArea.enabled = false;
			view.sendButton.enabled = false;
			var currentDate:Date = new Date();
			//TODO get info from the right source
			var m:ChatMessageVO = new ChatMessageVO();
			m.fromUserID = userSession.userId;
			m.fromUsername = userSession.userList.getUser(userSession.userId).name;
			m.fromColor = "0";
			m.fromTime = currentDate.time;
			m.fromTimezoneOffset = currentDate.timezoneOffset;
			m.fromLang = "en";
			m.message = view.inputArea.text;
			m.toUserID = publicChat ? "public_chat_userid" : view.userID;
			m.toUsername = publicChat ? "public_chat_username" : view.label;
			if (publicChat) {
				m.chatType = "PUBLIC_CHAT";
				chatMessageService.sendPublicMessage(m);
			} else {
				m.chatType = "PRIVATE_CHAT";
				chatMessageService.sendPrivateMessage(m);
			}
		}
		
		private function onSendSuccess(result:String):void {
			view.inputArea.enabled = true;
			view.sendButton.enabled = true;
			view.inputArea.text = "";
		}
		
		private function onSendFailure(status:String):void {
			view.inputArea.enabled = true;
			view.sendButton.enabled = true;
		}
		
		private function listUpdateCompleteHandler(e:FlexEvent):void {
			if (view.messageList.dataGroup.contentHeight > view.messageList.dataGroup.height) {
				view.messageList.dataGroup.verticalScrollPosition = view.messageList.dataGroup.contentHeight - view.messageList.dataGroup.height;
			}
		}
		
		override public function destroy():void {
			super.destroy();
			//view.dispose();
			view.messageList.dataProvider = null;
			
			chatMessageService.sendMessageOnSuccessSignal.remove(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.remove(onSendFailure);
			
			view.messageList.removeEventListener(FlexEvent.UPDATE_COMPLETE, listUpdateCompleteHandler);
			view.sendButton.removeEventListener(MouseEvent.CLICK, sendButtonClickHandler);
			view.inputArea.removeEventListener(KeyboardEvent.KEY_DOWN, inputAreaKeyDownHandler);
			
			userSession.userList.userRemovedSignal.remove(userRemoved);
			userSession.userList.userAddedSignal.remove(userAdded);
			view = null;
		}
	}
}
