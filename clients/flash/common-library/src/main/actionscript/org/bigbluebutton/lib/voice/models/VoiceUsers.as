package org.bigbluebutton.lib.voice.models {
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.Signal;
	
	public class VoiceUsers {
		private var _users:ArrayCollection = new ArrayCollection();
		
		private var _me:VoiceUser;
		
		public function get me():VoiceUser {
			return _me;
		}
		
		private var _userChangeSignal:Signal = new Signal();
		
		public function get userChangeSignal():Signal {
			return _userChangeSignal;
		}
		
		public function add(nuser:VoiceUser):void {
			var index:int = getIndex(nuser.intId);
			if (index != -1) {
				// replace this user with the new user
				_users.setItemAt(nuser, index);
			} else {
				_users.addItem(nuser);
			}
			
			if (nuser.me) {
				_me = nuser;
			}
			
			_userChangeSignal.dispatch(nuser, VoiceUserChangeEnum.JOIN);
		}
		
		public function remove(userId:String):VoiceUser {
			var index:int = getIndex(userId);
			if (index >= 0) {
				var removedUser:VoiceUser = _users.removeItemAt(index) as VoiceUser;
				
				if (_me == removedUser) {
					_me = null;
				}
				
				_userChangeSignal.dispatch(removedUser, VoiceUserChangeEnum.LEAVE);
				return removedUser;
			}
			
			return null;
		}
		
		public function getUser(userId:String):VoiceUser {
			var user:VoiceUser;
			
			for (var i:int = 0; i < _users.length; i++) {
				user = _users.getItemAt(i) as VoiceUser;
				
				if (user.intId == userId) {
					return user;
				}
			}
			
			return null;
		}
		
		public function getAll():Array {
			return _users.toArray();
		}
		
		public function changeUserMute(userId:String, muted:Boolean):void {
			var user:VoiceUser = getUser(userId);
			
			if (user != null) {
				user.muted = muted;
				if (muted) {
					// Force user to not talking if muted.
					user.talking = false;
				}
				_userChangeSignal.dispatch(user, VoiceUserChangeEnum.MUTE);
			}
		}
		
		public function changeUserTalking(userId:String, talking:Boolean):void {
			var user:VoiceUser = getUser(userId);
			
			if (user != null) {
				if (user.muted && talking) {
					// if user is muted, we don't want to set it as talking.
					return;
				}
				user.talking = talking;
				
				_userChangeSignal.dispatch(user, VoiceUserChangeEnum.TALKING);
			}
		}
		
		private function getIndex(userId:String):int {
			var user:VoiceUser;
			for (var i:int = 0; i < _users.length; i++) {
				user = _users.getItemAt(i) as VoiceUser;
				
				if (user.intId == userId) {
					return i;
				}
			}
			
			return -1;
		}
	}
}
