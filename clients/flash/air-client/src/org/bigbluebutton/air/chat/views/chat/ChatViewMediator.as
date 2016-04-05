package org.bigbluebutton.air.chat.views.chat {
	
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.ui.Keyboard;
	
	import mx.collections.ArrayCollection;
	import mx.events.FlexEvent;
	import mx.resources.ResourceManager;
	
	import spark.components.List;
	import spark.components.View;
	import spark.events.ViewNavigatorEvent;
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.chat.models.ChatMessage;
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.ChatMessages;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatViewMediator extends Mediator {
		
		[Inject]
		public var view:IChatView;
		
		[Inject]
		public var chatMessageService:IChatMessageService;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		protected var dataProvider:ArrayCollection;
		
		protected var list:List;
		
		protected var _publicChat:Boolean = true;
		
		protected var user:User;
		
		protected var data:Object;
		
		protected var deltaHeight:Number;
		
		protected var newMessages:Number;
		
		protected var firstNewMessageIndex:Number;
		
		override public function initialize():void {
			var userMe:User = userSession.userList.me;
			data = userUISession.currentPageDetails;
			if (data is User) {
				createNewChat(data as User);
			} else {
				var chatMessages:ChatMessages = data.chatMessages as ChatMessages;
				if (chatMessages.newMessages > 0) {
					newMessages = chatMessages.newMessages;
				}
				openChat(data);
			}
			var userLocked:Boolean = (!userSession.userList.me.presenter && userSession.userList.me.locked && userSession.userList.me.role != User.MODERATOR);
			if (_publicChat) {
				disableChat(userSession.lockSettings.disablePublicChat && !userMe.presenter && userMe.locked);
				userSession.lockSettings.disablePublicChatSignal.add(disableChat);
			} else {
				disableChat(userSession.lockSettings.disablePrivateChat && !userMe.presenter && userMe.locked);
				userSession.lockSettings.disablePrivateChatSignal.add(disableChat);
			}
			chatMessageService.sendMessageOnSuccessSignal.add(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.add(onSendFailure);
			chatMessagesSession.newChatMessageSignal.add(scrollUpdate);
			list.addEventListener(FlexEvent.UPDATE_COMPLETE, updateComplete);
			userSession.userList.userRemovedSignal.add(userRemoved);
			userSession.userList.userAddedSignal.add(userAdded);
			(view as View).addEventListener(ViewNavigatorEvent.VIEW_DEACTIVATE, viewDeactivateHandler);
		}
		
		private function updateComplete(e:FlexEvent):void {
			view.list.ensureIndexIsVisible(view.list.dataProvider.length - 1);
			var visibleIndices:Vector.<int> = view.list.dataGroup.getItemIndicesInView();
			displayNewMessagesBar((visibleIndices.length < newMessages));
			list.removeEventListener(FlexEvent.UPDATE_COMPLETE, updateComplete);
		}
		
		private function displayNewMessagesBar(value:Boolean):void {
			firstNewMessageIndex = dataProvider.length - newMessages;
			var time:String = (dataProvider.getItemAt(firstNewMessageIndex) as ChatMessage).time;
			view.newMessagesLabel.text = newMessages.toString() + " " + ResourceManager.getInstance().getString('resources', 'chat.unreadMessages') + " " + time;
			view.newMessages.visible = value;
			view.newMessages.includeInLayout = value;
			if (value) {
				view.list.addEventListener(MouseEvent.MOUSE_MOVE, isNewMessageVisible);
				view.newMessages.addEventListener(MouseEvent.CLICK, goToFirstNewMessage);
			} else {
				view.list.removeEventListener(MouseEvent.MOUSE_MOVE, isNewMessageVisible);
				view.newMessages.removeEventListener(MouseEvent.CLICK, goToFirstNewMessage);
			}
		}
		
		private function isNewMessageVisible(e:MouseEvent = null):void {
			if (isIndexVisible(firstNewMessageIndex)) {
				displayNewMessagesBar(false);
			}
		}
		
		private function isIndexVisible(i:int):Boolean {
			var visibleIndices:Vector.<int> = view.list.dataGroup.getItemIndicesInView();
			for each (var index:int in visibleIndices) {
				if (index == i) {
					return true;
				}
			}
			return false;
		}
		
		private function goToFirstNewMessage(e:MouseEvent):void {
			view.list.ensureIndexIsVisible(firstNewMessageIndex);
			displayNewMessagesBar(false);
		}
		
		private function disableChat(disable:Boolean):void {
			if (disable) {
				view.inputMessage.enabled = false;
				view.sendButton.enabled = false;
				(view as View).removeEventListener(KeyboardEvent.KEY_DOWN, KeyHandler);
				view.sendButton.removeEventListener(MouseEvent.CLICK, onSendButtonClick);
			} else {
				view.inputMessage.enabled = true;
				view.sendButton.enabled = true;
				(view as View).addEventListener(KeyboardEvent.KEY_DOWN, KeyHandler);
				view.sendButton.addEventListener(MouseEvent.CLICK, onSendButtonClick);
			}
		}
		
		private function KeyHandler(e:KeyboardEvent):void {
			if (e.keyCode == Keyboard.ENTER) {
				onSendButtonClick(null);
			}
		}
		
		/**
		 * Reset new messages count when user leaves the page
		 * */
		protected function viewDeactivateHandler(event:ViewNavigatorEvent):void {
			var chatMessages:ChatMessages = null;
			if (data is User) {
				chatMessages = chatMessagesSession.getPrivateMessages(user.userID, user.name).privateChat;
			} else {
				chatMessages = data.chatMessages as ChatMessages;
			}
			chatMessages.resetNewMessages();
		}
		
		/**
		 * When user left the conference, add '[Offline]' to the username
		 * and disable text input
		 */
		protected function userRemoved(userID:String):void {
			if (view != null && user && user.userID == userID) {
				view.inputMessage.enabled = false;
				view.pageName.text = user.name + ResourceManager.getInstance().getString('resources', 'userDetail.userOffline');
			}
		}
		
		/**
		 * When user returned(refreshed the page) to the conference, remove '[Offline]' from the username
		 * and enable text input
		 */
		protected function userAdded(newuser:User):void {
			if ((view != null) && (user != null) && (user.userID == newuser.userID)) {
				view.inputMessage.enabled = true;
				view.pageName.text = user.name;
			}
		}
		
		protected function createNewChat(user:User):void {
			_publicChat = false;
			this.user = user;
			view.pageName.text = user.name;
			view.inputMessage.enabled = chatMessagesSession.getPrivateMessages(user.userID, user.name).userOnline;
			dataProvider = chatMessagesSession.getPrivateMessages(user.userID, user.name).privateChat.messages;
			list = view.list;
			list.dataProvider = dataProvider;
		}
		
		protected function openChat(currentPageDetails:Object):void {
			_publicChat = currentPageDetails.hasOwnProperty("publicChat") ? currentPageDetails.publicChat : null;
			user = currentPageDetails.user;
			view.pageName.text = currentPageDetails.name;
			if (!_publicChat) {
				view.inputMessage.enabled = currentPageDetails.online;
				// if user went offline, and 'OFFLINE' marker is not already part of the string, add OFFLINE to the username
				if ((currentPageDetails.online == false) && (view.pageName.text.indexOf(ResourceManager.getInstance().getString('resources', 'userDetail.userOffline')) == -1)) {
					view.pageName.text += ResourceManager.getInstance().getString('resources', 'userDetail.userOffline');
				}
			}
			var chatMessages:ChatMessages = currentPageDetails.chatMessages as ChatMessages;
			chatMessages.resetNewMessages();
			dataProvider = chatMessages.messages as ArrayCollection;
			list = view.list;
			list.dataProvider = dataProvider;
		}
		
		private function scrollUpdate(userId:String = null, publicChat:Boolean = true):void {
			if ((user && userId == user.userID) || publicChat == _publicChat) {
				if (isIndexVisible(view.list.dataProvider.length - 2)) {
					view.list.ensureIndexIsVisible(view.list.dataProvider.length - 1);
				}
			}
		}
		
		private function onSendButtonClick(e:MouseEvent):void {
			view.inputMessage.enabled = false;
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
			m.message = view.inputMessage.text;
			m.toUserID = _publicChat ? "public_chat_userid" : user.userID;
			m.toUsername = _publicChat ? "public_chat_username" : user.name;
			if (_publicChat) {
				m.chatType = "PUBLIC_CHAT";
				chatMessageService.sendPublicMessage(m);
			} else {
				m.chatType = "PRIVATE_CHAT";
				chatMessageService.sendPrivateMessage(m);
			}
		}
		
		private function onSendSuccess(result:String):void {
			view.inputMessage.enabled = true;
			view.inputMessage.text = "";
		}
		
		private function onSendFailure(status:String):void {
			view.inputMessage.enabled = true;
			view.sendButton.enabled = true;
		}
		
		override public function destroy():void {
			super.destroy();
			chatMessagesSession.newChatMessageSignal.remove(scrollUpdate);
			list.removeEventListener(FlexEvent.UPDATE_COMPLETE, updateComplete);
			view.sendButton.removeEventListener(MouseEvent.CLICK, onSendButtonClick);
			chatMessageService.sendMessageOnSuccessSignal.remove(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.remove(onSendFailure);
			userSession.lockSettings.disablePublicChatSignal.remove(disableChat);
			userSession.lockSettings.disablePrivateChatSignal.remove(disableChat);
			userSession.userList.userRemovedSignal.remove(userRemoved);
			userSession.userList.userAddedSignal.remove(userAdded);
			(view as View).removeEventListener(ViewNavigatorEvent.VIEW_DEACTIVATE, viewDeactivateHandler);
			view.dispose();
			view = null;
		}
	}
}
