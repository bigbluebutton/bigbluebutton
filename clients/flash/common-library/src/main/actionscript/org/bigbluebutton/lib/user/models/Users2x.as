package org.bigbluebutton.lib.user.models {
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.Signal;
	
	public class Users2x {
		private var _users:ArrayCollection;
		
		private var _userChangeSignal:Signal = new Signal();
		
		public var me:User2x;
		
		public function get userChangeSignal():Signal {
			return _userChangeSignal;
		}
		
		public function Users2x() {
			_users = new ArrayCollection();
		}
		
		public function getUsers():Array {
			return _users.toArray();
		}
		
		public function add(user:User2x):void {
			if (getUserIndex(user.intId) == -1) {
				_users.addItem(user);
				_userChangeSignal.dispatch(user, UserChangeEnum.JOIN);
			}
		}
		
		public function remove(intId:String):User2x {
			var index:int = getUserIndex(intId);
			if (index >= 0) {
				var removedUser:User2x = _users.removeItemAt(index) as User2x;
				_userChangeSignal.dispatch(removedUser, UserChangeEnum.LEAVE);
				return removedUser;
			}
			
			return null;
		}
		
		public function getUser(intId:String):User2x {
			var user:User2x;
			for (var i:int = 0; i < _users.length; i++) {
				user = _users.getItemAt(i) as User2x;
				
				if (user.intId == intId) {
					return user;
				}
			}
			
			return null;
		}
		
		public function getUserIndex(intId:String):int {
			var user:User2x;
			for (var i:int = 0; i < _users.length; i++) {
				user = _users.getItemAt(i) as User2x;
				
				if (user.intId == intId) {
					return i;
				}
			}
			
			return -1;
		}
		
		public function getPresenter():User2x {
			var user:User2x;
			for (var i:int = 0; i < _users.length; i++) {
				user = _users.getItemAt(i) as User2x;
				
				if (user.presenter) {
					return user;
				}
			}
			return null;
		}
		
		public function changeUserLocked(intId:String, locked:Boolean):void {
			var user:User2x = getUser(intId);
			if (user != null) {
				user.locked = locked;
				_userChangeSignal.dispatch(user, UserChangeEnum.LOCKED);
			}
		}
		
		public function changePresenter(intId:String, presenter:Boolean):void {
			var user:User2x = getUser(intId);
			if (user != null) {
				user.presenter = presenter;
				_userChangeSignal.dispatch(user, UserChangeEnum.PRESENTER);
			}
		}
		
		public function changeUserStatus(intId:String, status:String):void {
			var user:User2x = getUser(intId);
			if (user != null && EmojiStatus.STATUS_ARRAY.indexOf(status)) {
				user.emoji = status;
				_userChangeSignal.dispatch(user, UserChangeEnum.EMOJI);
			}
		}
	}
}
