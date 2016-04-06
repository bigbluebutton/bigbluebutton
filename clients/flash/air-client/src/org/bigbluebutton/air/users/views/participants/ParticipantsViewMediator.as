package org.bigbluebutton.air.users.views.participants {
	
	import flash.events.MouseEvent;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import spark.events.IndexChangeEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.air.users.views.participants.guests.GuestResponseEvent;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.PrivateChatMessage;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ParticipantsViewMediator extends Mediator {
		
		[Inject]
		public var view:IParticipantsView;
		
		[Inject]
		public var userSession:IUserSession
		
		[Inject]
		public var userUISession:IUserUISession
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		protected var dataProviderConversations:ArrayCollection;
		
		protected var dataProvider:ArrayCollection;
		
		protected var dataProviderGuests:ArrayCollection;
		
		protected var dicUserIdtoUser:Dictionary;
		
		protected var dicUserIdtoGuest:Dictionary
		
		private var _userMe:User;
		
		private var _usersAdded:Array = new Array();
		
		override public function initialize():void {
			dataProvider = new ArrayCollection();
			view.list.dataProvider = dataProvider;
			view.list.addEventListener(IndexChangeEvent.CHANGE, onSelectParticipant);
			dicUserIdtoUser = new Dictionary();
			var users:ArrayCollection = userSession.userList.users;
			for each (var user:User in users) {
				addUser(user);
				if (user.me) {
					_userMe = user;
				}
			}
			userSession.userList.userChangeSignal.add(userChanged);
			userSession.userList.userAddedSignal.add(addUser);
			userSession.userList.userRemovedSignal.add(userRemoved);
			setPageTitle();
			dataProviderGuests = new ArrayCollection();
			view.guestsList.dataProvider = dataProviderGuests;
			view.guestsList.addEventListener(GuestResponseEvent.GUEST_RESPONSE, onSelectGuest);
			view.conversationsList.addEventListener(IndexChangeEvent.CHANGE, onSelectChat);
			view.allowAllButton.addEventListener(MouseEvent.CLICK, allowAllGuests);
			view.denyAllButton.addEventListener(MouseEvent.CLICK, denyAllGuests);
			dicUserIdtoGuest = new Dictionary();
			var guests:ArrayCollection = userSession.guestList.users;
			for each (var guest:User in guests) {
				addGuest(guest);
			}
			userSession.guestList.userAddedSignal.add(addGuest);
			userSession.guestList.userRemovedSignal.add(guestRemoved);
			if (_userMe.role == User.MODERATOR && dataProviderGuests.length > 0) {
				view.guestsList.visible = true;
				view.guestsList.includeInLayout = true;
				view.allGuests.visible = true;
				view.allGuests.includeInLayout = true;
			}
			userUISession.pushPage(PageEnum.PARTICIPANTS);
			initializeDataProviderConversations();
		}
		
		protected function onSelectChat(event:IndexChangeEvent):void {
			var item:Object = dataProviderConversations.getItemAt(event.newIndex);
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
		
		private function initializeDataProviderConversations():void {
			dataProviderConversations = new ArrayCollection();
			dataProviderConversations.addItem({name: ResourceManager.getInstance().getString('resources', 'chat.item.publicChat'), publicChat: true, user: null, chatMessages: chatMessagesSession.publicChat});
			for each (var chatObject:PrivateChatMessage in chatMessagesSession.privateChats) {
				chatObject.userOnline = userSession.userList.hasUser(chatObject.userID);
				chatObject.privateChat.chatMessageChangeSignal.add(populateList);
				if (chatObject.privateChat.messages.length > 0) {
					addChat({name: chatObject.userName, publicChat: false, user: userSession.userList.getUser(chatObject.userID), chatMessages: chatObject.privateChat, userID: chatObject.userID, online: chatObject.userOnline});
				}
			}
			view.conversationsList.dataProvider = dataProviderConversations;
		}
		
		public function populateList(UserID:String = null):void {
			var newUser:User = userSession.userList.getUserByUserId(UserID);
			if ((newUser != null) && (!isExist(newUser, dataProviderConversations)) && (!newUser.me)) {
				var pcm:PrivateChatMessage = chatMessagesSession.getPrivateMessages(newUser.userID, newUser.name);
				addChat({name: pcm.userName, publicChat: false, user: newUser, chatMessages: pcm.privateChat, userID: pcm.userID, online: true}, dataProvider.length - 1);
			}
			dataProviderConversations.refresh();
		}
		
		/**
		 * If user wasn't already added, adding to the data provider
		 **/
		private function addChat(chat:Object, pos:Number = NaN):void {
			if (!userAlreadyAdded(chat.userID)) {
				_usersAdded.push(chat.userID);
				if (isNaN(pos)) {
					dataProviderConversations.addItem(chat);
				} else {
					dataProviderConversations.addItemAt(chat, pos);
				}
			}
			//dataProvider.setItemAt(button, dataProvider.length-1);
			dataProviderConversations.refresh();
			setPageTitle();
			//dicUsertoChat[chat.user] = chat;				
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
		 * Check if User is already added to the dataProvider
		 *
		 * @param User
		 */
		private function isExist(user:User, dp:ArrayCollection):Boolean {
			for (var i:int = 0; i < dp.length; i++) {
				if (dp.getItemAt(i).userID == user.userID) {
					return true;
				}
			}
			return false;
		}
		
		private function addUser(user:User):void {
			dataProvider.addItem(user);
			dataProvider.refresh();
			dicUserIdtoUser[user.userID] = user;
			setPageTitle();
		}
		
		private function addGuest(guest:Object):void {
			dataProviderGuests.addItem(guest);
			dataProviderGuests.refresh();
			dicUserIdtoGuest[guest.userID] = guest;
			if (_userMe.role == User.MODERATOR && dataProviderGuests.length > 0) {
				view.guestsList.visible = true;
				view.guestsList.includeInLayout = true;
				view.allGuests.visible = true;
				view.allGuests.includeInLayout = true;
			}
		}
		
		private function userRemoved(userID:String):void {
			var user:User = dicUserIdtoUser[userID] as User;
			var index:uint = dataProvider.getItemIndex(user);
			dataProvider.removeItemAt(index);
			dicUserIdtoUser[user.userID] = null;
			setPageTitle();
		}
		
		private function guestRemoved(userID:String):void {
			var guest:User = dicUserIdtoGuest[userID] as User;
			if (guest) {
				var index:uint = dataProviderGuests.getItemIndex(guest);
				dataProviderGuests.removeItemAt(index);
				dicUserIdtoGuest[guest.userID] = null;
				if (_userMe.role == User.MODERATOR && dataProviderGuests.length == 0 && view && view.guestsList != null) {
					view.guestsList.includeInLayout = false;
					view.guestsList.visible = false;
					view.allGuests.includeInLayout = false;
					view.allGuests.visible = false;
				}
			}
		}
		
		private function userChanged(user:User, property:String = null):void {
			dataProvider.refresh();
			if (_userMe.role == User.MODERATOR && dataProviderGuests.length > 0) {
				view.guestsList.visible = true;
				view.guestsList.includeInLayout = true;
				view.allGuests.visible = true;
				view.allGuests.includeInLayout = true;
			} else {
				view.guestsList.visible = false;
				view.guestsList.includeInLayout = false;
				view.allGuests.visible = false;
				view.allGuests.includeInLayout = false;
			}
		}
		
		protected function onSelectParticipant(event:IndexChangeEvent):void {
			if (event.newIndex >= 0) {
				var user:User = dataProvider.getItemAt(event.newIndex) as User;
				userUISession.pushPage(PageEnum.USER_DETAILS, user, TransitionAnimationEnum.SLIDE_LEFT);
			}
		}
		
		protected function onSelectGuest(event:GuestResponseEvent):void {
			usersService.responseToGuest(event.guestID, event.allow);
		}
		
		protected function allowAllGuests(event:MouseEvent):void {
			usersService.responseToAllGuests(true);
		}
		
		protected function denyAllGuests(event:MouseEvent):void {
			usersService.responseToAllGuests(false);
		}
		
		/**
		 * Count participants and set page title accordingly
		 **/
		private function setPageTitle():void {
			if (dataProvider != null) {
				FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'participants.title');
			}
		}
		
		override public function destroy():void {
			view.list.removeEventListener(IndexChangeEvent.CHANGE, onSelectParticipant);
			view.guestsList.removeEventListener(GuestResponseEvent.GUEST_RESPONSE, onSelectGuest);
			view.conversationsList.removeEventListener(IndexChangeEvent.CHANGE, onSelectChat);
			view.allowAllButton.removeEventListener(MouseEvent.CLICK, allowAllGuests);
			view.denyAllButton.removeEventListener(MouseEvent.CLICK, denyAllGuests);
			
			for each (var chatObject:PrivateChatMessage in chatMessagesSession.privateChats) {
				chatObject.privateChat.chatMessageChangeSignal.remove(populateList);
			}
			
			userSession.userList.userChangeSignal.remove(userChanged);
			userSession.userList.userAddedSignal.remove(addUser);
			userSession.userList.userRemovedSignal.remove(userRemoved);
			userSession.guestList.userAddedSignal.remove(addGuest);
			super.destroy();
			view.dispose();
			view = null;
		}
	}
}
