package org.bigbluebutton.air.presentation.views.selectwebcam {
	
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.events.FlexMouseEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.user.models.User2x;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.SkinnablePopUpContainer;
	
	public class SelectStreamPopUpMediator extends Mediator {
		
		[Inject]
		public var view:ISelectStreamPopUp;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUISession;
		
		protected var dataProvider:ArrayCollection;
		
		private var speaker:User = null;
		
		private var selectedIndex:int = -1;
		
		private var indexChange:Boolean = false;
		
		private var displayWebcam:Boolean;
		
		override public function initialize():void {
			userSession.userList.userRemovedSignal.add(userRemovedHandler);
			userSession.userList.userAddedSignal.add(userAddedHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			view.streamList.addEventListener(MouseEvent.CLICK, onSelectStream);
			view.actionButton.addEventListener(MouseEvent.CLICK, clickedActionButton);
			dataProvider = new ArrayCollection();
			view.streamList.dataProvider = dataProvider;
			var users:ArrayCollection = userSession.userList.users;
			for each (var u:User in users) {
				if (u.streamName && u.streamName != "" && !dataProvider.contains(u)) {
					addUserStreamNames(u);
				}
			}
			updateSelectedIndex();
			view.addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, closePopUp);
		}
		
		private function closePopUp(e:FlexMouseEvent):void {
			view.close(false);
		}
		
		/**
		 *
		 */
		private function updateSelectedIndex():void {
			view.streamList.selectedIndex = selectedIndex;
			if (selectedIndex == -1) {
				view.actionButton.enabled = false;
				view.actionButton.skin.setCurrentState("disabled");
				view.actionButton.label = ResourceManager.getInstance().getString('resources', 'selectStream.viewWebcam');
			} else {
				view.actionButton.enabled = true
				view.actionButton.skin.setCurrentState("up");
				if (userUISession.currentStreamName == "" || indexChange) {
					displayWebcam = true;
					view.actionButton.label = ResourceManager.getInstance().getString('resources', 'selectStream.viewWebcam');
				} else {
					displayWebcam = false;
					view.actionButton.label = ResourceManager.getInstance().getString('resources', 'selectStream.hideWebcam');
				}
			}
		}
		
		private function clickedActionButton(e:MouseEvent):void {
			var selectedStream:Object = null;
			if (displayWebcam) {
				selectedStream = dataProvider.getItemAt(view.streamList.selectedIndex);
			}
			(view as SkinnablePopUpContainer).close(true, selectedStream);
		}
		
		private function addUserStreamNames(u:User):void {
			var existingStreamNames:Array = getUserStreamNamesByUserID(u.userID);
			var streamNames:Array = u.streamName.split("|");
			for each (var streamName:String in streamNames) {
				var addNew:Boolean = true;
				for each (var existingUserStreamName:UserStreamName in existingStreamNames) {
					if (streamName == existingUserStreamName.streamName) {
						addNew = false;
					}
				}
				if (addNew) {
					var userStreamName:UserStreamName = new UserStreamName(streamName, u);
					dataProvider.addItem(userStreamName);
					if (streamName == userUISession.currentStreamName) {
						selectedIndex = dataProvider.getItemIndex(userStreamName);
					}
				}
			}
			dataProvider.refresh();
		}
		
		private function onSelectStream(event:MouseEvent):void {
			if (view.streamList.selectedIndex != selectedIndex) {
				indexChange = true;
			}
			selectedIndex = view.streamList.selectedIndex;
			updateSelectedIndex();
		}
		
		override public function destroy():void {
			userSession.userList.userRemovedSignal.remove(userRemovedHandler);
			userSession.userList.userAddedSignal.remove(userAddedHandler);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			view.streamList.removeEventListener(MouseEvent.CLICK, onSelectStream);
			view.actionButton.removeEventListener(MouseEvent.CLICK, clickedActionButton);
			view.removeEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, closePopUp);
			view.dispose();
			view = null;
			super.destroy();
		}
		
		private function userAddedHandler(user:User):void {
			if (user.streamName && user.streamName != "") {
				var streamNames:Array = user.streamName.split("|");
				for each (var streamName:String in streamNames) {
					var userStreamName:UserStreamName = new UserStreamName(streamName, user);
					dataProvider.addItem(userStreamName);
				}
			}
		}
		
		private function removeUserFromDataProvider(userID:String):void {
			for (var item:int; item < dataProvider.length; item++) {
				if ((dataProvider.getItemAt(item).user as User).userID == userID) {
					// -- in the end. see: http://stackoverflow.com/questions/4255226/how-to-remove-an-item-while-iterating-over-collection
					dataProvider.removeItemAt(item--);
				}
			}
		}
		
		private function userRemovedHandler(userID:String):void {
			removeUserFromDataProvider(userID);
		}
		
		private function getUserStreamNamesByUserID(userID:String):Array {
			var userStreamNames:Array = new Array();
			for each (var userStreamName:UserStreamName in dataProvider) {
				if (userStreamName.user.userID == userID) {
					userStreamNames.push(userStreamName);
				}
			}
			return userStreamNames;
		}
		
		private function userChangeHandler(user:User2x, property:int):void {
			if (property == UserList.HAS_STREAM) {
				var userStreamNames:Array = getUserStreamNamesByUserID(user.userID);
				for each (var userStreamName:UserStreamName in userStreamNames) {
					if (!(userStreamName.user.streamName.indexOf(userStreamName.streamName) >= 0)) {
						dataProvider.removeItemAt(dataProvider.getItemIndex(userStreamName));
					}
				}
				if (user.streamName.split("|").length > userStreamNames.length && user.streamName.length > 0) {
					var camNumber:int = dataProvider.length;
					addUserStreamNames(user);
				}
				dataProvider.refresh();
			}
		}
		
		private function getDisplayedUser():User {
			for each (var userStreamName:UserStreamName in dataProvider) {
				if (userStreamName.streamName == userUISession.currentStreamName) {
					return userStreamName.user;
				}
			}
			return null;
		}
	}
}
