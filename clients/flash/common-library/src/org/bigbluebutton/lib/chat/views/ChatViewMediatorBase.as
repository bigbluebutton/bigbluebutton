package org.bigbluebutton.lib.chat.views {
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.ui.Keyboard;
	
	import mx.utils.StringUtil;
	
	import org.bigbluebutton.lib.chat.models.ChatMessage;
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.ChatMessages;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:ChatViewBase;
		
		[Inject]
		public var chatMessageService:IChatMessageService;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var userSession:IUserSession;
		
		protected var _publicChat:Boolean = true;
		
		protected var _user:User;
		
		override public function initialize():void {
			chatMessageService.sendMessageOnSuccessSignal.add(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.add(onSendFailure);
			chatMessagesSession.newChatMessageSignal.add(scrollUpdate);
			userSession.userList.userRemovedSignal.add(userRemoved);
			userSession.userList.userAddedSignal.add(userAdded);
			
			view.textInput.addEventListener(KeyboardEvent.KEY_DOWN, keyDownHandler);
			view.sendButton.addEventListener(MouseEvent.CLICK, sendButtonClickHandler);
			
			// TEMP CODE NEED TO REMOVE SOMEHOW
			_publicChat = true;
			chatMessagesSession.publicChat
			openChat(chatMessagesSession.publicChat);
			// END OF TEMP CODE
		}
		
		protected function openChat(chatMessages:ChatMessages):void {
			chatMessages.resetNewMessages();
			view.chatList.dataProvider = chatMessages.messages;
		}
	
		private function onSendSuccess(result:String):void {
			view.textInput.enabled = true;
			view.textInput.text = "";
		}
		
		private function onSendFailure(status:String):void {
			view.textInput.enabled = true;
		}
		
		private function scrollUpdate(userId:String = null, publicChat:Boolean = true):void {
			if ((_publicChat && publicChat) || (!_publicChat && !publicChat && _user && userId == _user.userID)) {
				if (isIndexVisible(view.chatList.dataProvider.length - 2)) {
					view.chatList.ensureIndexIsVisible(view.chatList.dataProvider.length - 1);
				}
			}
		}
		
		private function isIndexVisible(itemIndex:int):Boolean {
			return view.chatList.dataGroup.getItemIndicesInView().indexOf(itemIndex) > -1;
		}
		
		/**
		 * When user left the conference, add '[Offline]' to the username
		 * and disable text input
		 */
		protected function userRemoved(userID:String):void {
			if (view != null && _user && _user.userID == userID) {
				view.textInput.enabled = false;
			}
		}
		
		/**
		 * When user returned(refreshed the page) to the conference, remove '[Offline]' from the username
		 * and enable text input
		 */
		protected function userAdded(newuser:User):void {
			if ((view != null) && (_user != null) && (_user.userID == newuser.userID)) {
				view.textInput.enabled = true;
			}
		}
		
		private function keyDownHandler(e:KeyboardEvent):void {
			if (e.keyCode == Keyboard.ENTER && !e.shiftKey) {
				sendButtonClickHandler(null);
			}
		}
		
		private function sendButtonClickHandler(e:MouseEvent):void {
			view.textInput.enabled = false;
			
			var message:String = StringUtil.trim(view.textInput.text);
			
			if (message) {
				var currentDate:Date = new Date();
				//TODO get info from the right source
				var m:ChatMessageVO = new ChatMessageVO();
				m.fromUserID = userSession.userId;
				m.fromUsername = userSession.userList.getUser(userSession.userId).name;
				m.fromColor = "0";
				m.fromTime = currentDate.time;
				m.fromTimezoneOffset = currentDate.timezoneOffset;
				m.fromLang = "en";
				m.message = message;
				m.toUserID = _publicChat ? "public_chat_userid" : _user.userID;
				m.toUsername = _publicChat ? "public_chat_username" : _user.name;
				if (_publicChat) {
					m.chatType = "PUBLIC_CHAT";
					chatMessageService.sendPublicMessage(m);
				} else {
					m.chatType = "PRIVATE_CHAT";
					chatMessageService.sendPrivateMessage(m);
				}
			}
		}
		
		override public function destroy():void {
			chatMessageService.sendMessageOnSuccessSignal.remove(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.remove(onSendFailure);
			chatMessagesSession.newChatMessageSignal.remove(scrollUpdate);
			userSession.userList.userRemovedSignal.remove(userRemoved);
			userSession.userList.userAddedSignal.remove(userAdded);
			
			view.textInput.removeEventListener(KeyboardEvent.KEY_DOWN, keyDownHandler);
			view.sendButton.removeEventListener(MouseEvent.CLICK, sendButtonClickHandler);
			
			super.destroy();
			view = null;
		}
	}
}
