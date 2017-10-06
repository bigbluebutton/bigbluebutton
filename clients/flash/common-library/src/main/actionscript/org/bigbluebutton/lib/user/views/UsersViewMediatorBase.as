package org.bigbluebutton.lib.user.views {
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.user.events.UserItemSelectedEvent;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.models.UserChangeEnum;
	import org.bigbluebutton.lib.user.views.models.UserVM;
	import org.bigbluebutton.lib.user.views.models.UsersVMCollection;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UsersViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:UsersViewBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Bindable]
		private var _userCollection:UsersVMCollection;
		
		override public function initialize():void {
			initializeUserCollection();
			view.userList.dataProvider = _userCollection;
			
			meetingData.users.userChangeSignal.add(onUserChangeSignal);
			
			view.userList.addEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
		}
		
		private function initializeUserCollection():void {
			_userCollection = new UsersVMCollection();
			var users:Array = meetingData.users.getUsers();
			var userVM:UserVM;
			var roomLocked:Boolean = meetingData.meetingStatus.lockSettings.isRoomLocked();
			
			for each (var user:User2x in users) {
				addUser(user);
			}
			
			//TODO: Add voice only users
			
			_userCollection.refresh();
		}
		
		private function onUserChangeSignal(user:User2x, property:int):void {
			var userVM:UserVM;
			
			switch (property) {
				case UserChangeEnum.JOIN:
					addUser(user);
					break;
				case UserChangeEnum.LEAVE:
					removeUser(user);
					break;
				case UserChangeEnum.PRESENTER:
					userVM = findUser(user.intId);
					if (userVM) {
						userVM.presenter = user.presenter;
						_userCollection.refresh();
					}
					break;
				case UserChangeEnum.LOCKED:
					userVM = findUser(user.intId);
					if (userVM) {
						userVM.locked = user.locked;
						_userCollection.refresh();
					}
					break;
			}
		}
		
		private function addUser(user:User2x, initLoad:Boolean=false):void {
			var userVM:UserVM = new UserVM();
			userVM.intId = user.intId;
			userVM.extId = user.extId;
			userVM.name = user.name;
			userVM.role = user.role;
			userVM.presenter = user.presenter;
			userVM.locked = user.locked;
			userVM.avatarURL = user.avatar;
			userVM.emoji = user.emoji;
			
			// Needs to be grabbed from the new VoiceUser info
			userVM.talking = false;
			userVM.phoneUser = false;
			userVM.listenOnly = false;
			
			// Needs to be grabbed from room lock state
			userVM.roomLocked = false;
			
			//TODO: Add webcam state
			
			_userCollection.addItem(userVM);
			
			if (!initLoad) 
				_userCollection.refresh();
		}
		
		private function removeUser(userToRemove:User2x):void {
			for (var i:int = 0; i < _userCollection.length; i++) {
				var user:UserVM = _userCollection.getItemAt(i) as UserVM;
				if (user.intId == userToRemove.intId) {
					_userCollection.removeItemAt(i);
					return;
				}
			}
		}
		
		private function findUser(intId:String):UserVM {
			for (var i:int = 0; i < _userCollection.length; i++) {
				var user:UserVM = _userCollection.getItemAt(i) as UserVM;
				if (user.intId == intId) {
					return user;
				}
			}
			return null;
		}
		
		protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			// leave the implementation to the specific client
		}
		
		override public function destroy():void {
			meetingData.users.userChangeSignal.remove(onUserChangeSignal);
			view.userList.removeEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
			
			super.destroy();
			view = null;
		}
	}
}
