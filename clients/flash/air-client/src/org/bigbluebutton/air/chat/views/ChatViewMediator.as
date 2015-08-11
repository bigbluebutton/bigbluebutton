package org.bigbluebutton.air.chat.views {
	
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.events.FlexEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.models.ChatMessages;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.user.models.User;
	import org.osflash.signals.ISignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.List;
	import spark.components.View;
	import spark.events.ViewNavigatorEvent;
	
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
		
		protected var usersSignal:ISignal;
		
		protected var list:List;
		
		protected var publicChat:Boolean = true;
		
		protected var user:User;
		
		protected var data:Object;
		
		override public function initialize():void {
			data = userUISession.currentPageDetails;
			if (data is User) {
				createNewChat(data as User);
			} else {
				openChat(data);
			}
			chatMessageService.sendMessageOnSuccessSignal.add(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.add(onSendFailure);
			list.addEventListener(FlexEvent.UPDATE_COMPLETE, scrollUpdate);
			view.sendButton.addEventListener(MouseEvent.CLICK, onSendButtonClick);
			userSession.userList.userRemovedSignal.add(userRemoved);
			userSession.userList.userAddedSignal.add(userAdded);
			(view as View).addEventListener(ViewNavigatorEvent.VIEW_DEACTIVATE, viewDeactivateHandler);
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
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
			if (view != null && user.userID == userID) {
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
			publicChat = false;
			this.user = user;
			view.pageName.text = user.name;
			view.inputMessage.enabled = chatMessagesSession.getPrivateMessages(user.userID, user.name).userOnline;
			dataProvider = chatMessagesSession.getPrivateMessages(user.userID, user.name).privateChat.messages;
			list = view.list;
			list.dataProvider = dataProvider;
		}
		
		protected function openChat(currentPageDetails:Object):void {
			publicChat = currentPageDetails.publicChat;
			user = currentPageDetails.user;
			view.pageName.text = currentPageDetails.name;
			if (!publicChat) {
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
		
		private function scrollUpdate(e:Event):void {
			if (list.dataGroup.contentHeight > list.dataGroup.height) {
				list.dataGroup.verticalScrollPosition = list.dataGroup.contentHeight - list.dataGroup.height;
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
			m.toUserID = publicChat ? "public_chat_userid" : user.userID;
			m.toUsername = publicChat ? "public_chat_username" : user.name;
			if (publicChat) {
				m.chatType = "PUBLIC_CHAT";
				chatMessageService.sendPublicMessage(m);
			} else {
				m.chatType = "PRIVATE_CHAT";
				chatMessageService.sendPrivateMessage(m);
			}
		}
		
		private function onSendSuccess(result:String):void {
			view.inputMessage.enabled = true;
			view.sendButton.enabled = true;
			view.inputMessage.text = "";
		}
		
		private function onSendFailure(status:String):void {
			view.inputMessage.enabled = true;
			view.sendButton.enabled = true;
		}
		
		override public function destroy():void {
			super.destroy();
			list.removeEventListener(FlexEvent.UPDATE_COMPLETE, scrollUpdate);
			view.sendButton.removeEventListener(MouseEvent.CLICK, onSendButtonClick);
			chatMessageService.sendMessageOnSuccessSignal.remove(onSendSuccess);
			chatMessageService.sendMessageOnFailureSignal.remove(onSendFailure);
			userSession.userList.userRemovedSignal.remove(userRemoved);
			userSession.userList.userAddedSignal.remove(userAdded);
			(view as View).removeEventListener(ViewNavigatorEvent.VIEW_DEACTIVATE, viewDeactivateHandler);
			view.dispose();
			view = null;
		}
	}
}
