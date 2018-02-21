package org.bigbluebutton.lib.chat.views {
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.ui.Keyboard;
	
	import mx.utils.StringUtil;
	
	import spark.components.VScrollBar;
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.GroupChat;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.models.UserChangeEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:ChatViewBase;
		
		[Inject]
		public var chatMessageService:IChatMessageService;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		protected var _chat:GroupChat;
		
		override public function initialize():void {
			chatMessageService.sendMessageOnSuccessSignal.add(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.add(onSendFailure);
			meetingData.users.userChangeSignal.add(onUserChange);
			
			view.textInput.addEventListener(KeyboardEvent.KEY_DOWN, keyDownHandler);
			view.sendButton.addEventListener(MouseEvent.CLICK, sendButtonClickHandler);
		}
		
		protected function openChat(chat:GroupChat):void {
			if (_chat) {
				_chat.newMessageSignal.remove(onNewMessage);
			}
			
			_chat = chat;
			if (_chat) {
				_chat.newMessages = 0; //resetNewMessages();
				view.chatList.dataProvider = _chat.messages;
				_chat.newMessageSignal.add(onNewMessage);
			}
		}
		
		protected function onNewMessage(chatId:String):void {
			if (_chat && _chat.chatId == chatId) {
				if (view) {
					var vScrollBar:VScrollBar = view.chatList.scroller.verticalScrollBar;
					if (vScrollBar) {
						vScrollBar.value = vScrollBar.maximum;
					}
				}
				_chat.newMessages = 0;
			}
		}
		
		private function onSendSuccess(result:String):void {
			view.textInput.enabled = true;
			view.textInput.text = "";
		}
		
		private function onSendFailure(status:String):void {
			view.textInput.enabled = true;
		}
		
		private function onUserChange(user:User2x, prop:int):void {
			switch (prop) {
				case UserChangeEnum.JOIN:
					userAdded(user);
					break;
				case UserChangeEnum.LEAVE:
					userRemoved(user);
					break;
			}
		}
		
		/**
		 * When user left the conference, add '[Offline]' to the username
		 * and disable text input
		 */
		protected function userRemoved(user:User2x):void {
			if (view != null && _chat && _chat.partnerId == user.intId) {
				view.textInput.enabled = false;
			}
		}
		
		/**
		 * When user returned(refreshed the page) to the conference, remove '[Offline]' from the username
		 * and enable text input
		 */
		protected function userAdded(newUser:User2x):void {
			if ((view != null) && (_chat != null) && (_chat.partnerId == newUser.intId)) {
				view.textInput.enabled = true;
			}
		}
		
		private function keyDownHandler(e:KeyboardEvent):void {
			if (e.keyCode == Keyboard.ENTER && !e.shiftKey) {
				sendButtonClickHandler(null);
			}
		}
		
		private function sendButtonClickHandler(e:MouseEvent):void {
			var message:String = StringUtil.trim(view.textInput.text);
			
			if (message) {
				view.textInput.enabled = false;
				
				var currentDate:Date = new Date();
				//TODO get info from the right source
				var m:ChatMessageVO = new ChatMessageVO();
				m.fromUserId = meetingData.users.me.intId;
				m.fromUsername = meetingData.users.me.name;
				m.fromColor = "0";
				m.fromTime = currentDate.time;
				m.message = message;
				
				chatMessageService.sendChatMessage(_chat.chatId, m);
				
			}
		}
		
		override public function destroy():void {
			chatMessageService.sendMessageOnSuccessSignal.remove(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.remove(onSendFailure);
			meetingData.users.userChangeSignal.remove(onUserChange);
			
			if (_chat) {
				_chat.newMessageSignal.remove(onNewMessage);
			}
			
			view.textInput.removeEventListener(KeyboardEvent.KEY_DOWN, keyDownHandler);
			view.sendButton.removeEventListener(MouseEvent.CLICK, sendButtonClickHandler);
			
			super.destroy();
			view = null;
		}
	}
}
