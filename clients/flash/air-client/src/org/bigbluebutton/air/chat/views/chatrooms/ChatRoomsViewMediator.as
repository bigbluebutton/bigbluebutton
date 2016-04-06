package org.bigbluebutton.air.chat.views.chatrooms {
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import spark.components.List;
	import spark.events.IndexChangeEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.PrivateChatMessage;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChatRoomsViewMediator extends Mediator {
		
		[Inject]
		public var view:IChatRoomsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		protected var dataProvider:ArrayCollection;
		
		protected var list:List;
		
		protected var button:Object;
		
		private var _usersAdded:Array = new Array();
		
		override public function initialize():void {
			dataProvider = new ArrayCollection();
			dataProvider.addItem({name: ResourceManager.getInstance().getString('resources', 'chat.item.publicChat'), publicChat: true, user: null, chatMessages: chatMessagesSession.publicChat});
			for each (var chatObject:PrivateChatMessage in chatMessagesSession.privateChats) {
				chatObject.userOnline = userSession.userList.hasUser(chatObject.userID);
				chatObject.privateChat.chatMessageChangeSignal.add(populateList);
				if (chatObject.privateChat.messages.length > 0) {
					addChat({name: chatObject.userName, publicChat: false, user: userSession.userList.getUser(chatObject.userID), chatMessages: chatObject.privateChat, userID: chatObject.userID, online: chatObject.userOnline});
				}
			}
			button = {button: true};
			dataProvider.addItem(button);
			list = view.list;
			list.dataProvider = dataProvider;
			list.addEventListener(IndexChangeEvent.CHANGE, onIndexChangeHandler);
			chatMessagesSession.publicChat.chatMessageChangeSignal.add(refreshList);
			userSession.userList.userRemovedSignal.add(userRemoved);
			userSession.userList.userAddedSignal.add(userAdded);
			setPageTitle();
			chatMessagesSession.chatMessageChangeSignal.add(newMessageReceived);
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = true;
			userUISession.pushPage(PageEnum.CHATROOMS);
		}
		
		/**
		 * When new message is received, add user to private messages and subscribe to messages update
		 * */
		private function newMessageReceived(userID:String):void {
			var user:User = userSession.userList.getUser(userID);
			var pcm:PrivateChatMessage = chatMessagesSession.getPrivateMessages(user.userID, user.name);
			// TODO : check if this needs to be removed on destroy
			pcm.privateChat.chatMessageChangeSignal.add(populateList);
			if (pcm.privateChat.messages.length > 0) {
				addChat({name: pcm.userName, publicChat: false, user: user, chatMessages: pcm.privateChat, userID: pcm.userID, online: true}, dataProvider.length - 1);
			}
		}
		
		/**
		 * if user removed, sets online property to false and updates data provider
		 **/
		private function userRemoved(userID:String):void {
			var userLeft:Object = getItemFromDataProvider(userID);
			if (userLeft != null) {
				userLeft.online = false;
				dataProvider.itemUpdated(userLeft);
			}
		}
		
		/**
		 * if user added, sets online property to true and updates data provider
		 **/
		private function userAdded(user:Object):void {
			var userAdded:Object = getItemFromDataProvider(user.userID);
			if (userAdded != null) {
				userAdded.online = true;
				dataProvider.itemUpdated(userAdded);
			}
		}
		
		/**
		 * Get item from data provider based on user id
		 **/
		private function getItemFromDataProvider(UserID:String):Object {
			for (var i:int = 0; i < dataProvider.length; i++) {
				if (dataProvider.getItemAt(i).userID == UserID) {
					return dataProvider.getItemAt(i);
				}
			}
			return null;
		}
		
		/**
		 * When new message is being added to public chat, we only need to refresh data provider
		 */
		private function refreshList(UserID:String = null):void {
			if (userUISession.currentPageDetails.publicChat) {
				// split view with public chat open: no new messages to show
				chatMessagesSession.publicChat.resetNewMessages();
			} else {
				dataProvider.refresh();
			}
		}
		
		/**
		 * Count chat rooms and set page title accordingly
		 */
		private function setPageTitle():void {
			if (dataProvider != null) {
				FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'chat.title') + " (" + (dataProvider.length - 1) + ")";
			}
		}
		
		/**
		 * Populate ArrayCollection after a new message was received
		 *
		 * @param UserID
		 */
		private function populateList(UserID:String = null):void {
			var newUser:User = userSession.userList.getUserByUserId(UserID);
			if ((newUser != null) && (!isExist(newUser)) && (!newUser.me)) {
				var pcm:PrivateChatMessage = chatMessagesSession.getPrivateMessages(newUser.userID, newUser.name);
				addChat({name: pcm.userName, publicChat: false, user: newUser, chatMessages: pcm.privateChat, userID: pcm.userID, online: true}, dataProvider.length - 1);
			}
			dataProvider.refresh();
		}
		
		/**
		 * Check if User is already added to the dataProvider
		 *
		 * @param User
		 */
		private function isExist(user:User):Boolean {
			for (var i:int = 0; i < dataProvider.length; i++) {
				if (dataProvider.getItemAt(i).userID == user.userID) {
					return true;
				}
			}
			return false;
		}
		
		/**
		 * Check if User was already added to the data provider
		 **/
		private function userAlreadyAdded(userID:String):Boolean {
			for each (var str:String in _usersAdded) {
				if (userID == str) {
					return true;
				}
			}
			return false;
		}
		
		/**
		 * If user wasn't already added, adding to the data provider
		 **/
		private function addChat(chat:Object, pos:Number = NaN):void {
			if (!userAlreadyAdded(chat.userID)) {
				_usersAdded.push(chat.userID);
				if (isNaN(pos)) {
					dataProvider.addItem(chat);
				} else {
					dataProvider.addItemAt(chat, pos);
				}
			}
			dataProvider.refresh();
			setPageTitle();
		}
		
		protected function onIndexChangeHandler(event:IndexChangeEvent):void {
			var item:Object = dataProvider.getItemAt(event.newIndex);
			if (item) {
				if (item.hasOwnProperty("button")) {
					userUISession.pushPage(PageEnum.SELECT_PARTICIPANT, item, TransitionAnimationEnum.SLIDE_LEFT)
				} else {
					userUISession.pushPage(PageEnum.CHAT, item, TransitionAnimationEnum.SLIDE_LEFT)
				}
			} else {
				throw new Error("item null on ChatRoomsViewMediator");
			}
		}
		
		override public function destroy():void {
			super.destroy();
			
			for each (var chatObject:PrivateChatMessage in chatMessagesSession.privateChats) {
				chatObject.privateChat.chatMessageChangeSignal.remove(populateList);
			}
			
			chatMessagesSession.publicChat.chatMessageChangeSignal.remove(refreshList);
			userSession.userList.userRemovedSignal.remove(userRemoved);
			userSession.userList.userAddedSignal.remove(userAdded);
			chatMessagesSession.chatMessageChangeSignal.remove(newMessageReceived);
			list.removeEventListener(IndexChangeEvent.CHANGE, onIndexChangeHandler);
			
			view.dispose();
			view = null;
		}
	}
}
