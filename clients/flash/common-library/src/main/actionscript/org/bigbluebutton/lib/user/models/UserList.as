package org.bigbluebutton.lib.user.models {
	
	import mx.collections.ArrayCollection;
	
	import spark.collections.Sort;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class UserList {
		public static const MODERATOR:int = 0;
		
		public static const HAS_STREAM:int = 1;
		
		public static const PRESENTER:int = 2;
		
		public static const JOIN_AUDIO:int = 3;
		
		public static const MUTE:int = 4;
		
		public static const TALKING:int = 5;
		
		public static const STATUS:int = 6;
		
		public static const LOCKED:int = 7;
		
		public static const LISTEN_ONLY:int = 8;
		
		public static const LEAVE_AUDIO:int = 9;
		
		private var _users:ArrayCollection;
		
		[Bindable]
		public function get users():ArrayCollection {
			return _users;
		}
		
		private function set users(value:ArrayCollection):void {
			_users = value;
		}
		
		private var _me:User;
		
		public function get me():User {
			return _me;
		}
		
		private function set me(value:User):void {
			_me = value;
		}
		
		private var _sort:Sort;
		
		public function UserList() {
			_me = new User();
			_users = new ArrayCollection();
			_sort = new Sort();
			_sort.compareFunction = sortFunction;
			_users.sort = _sort;
		}
		
		/**
		 * Dispatched when all participants are added
		 */
		private var _allUsersAddedSignal:Signal = new Signal();
		
		public function get allUsersAddedSignal():ISignal {
			return _allUsersAddedSignal;
		}
		
		/**
		 * Dispatched when a participant is added
		 */
		private var _userAddedSignal:Signal = new Signal();
		
		public function get userAddedSignal():ISignal {
			return _userAddedSignal;
		}
		
		/**
		 * Dispatched when a participant is removed
		 */
		private var _userRemovedSignal:Signal = new Signal();
		
		public function get userRemovedSignal():ISignal {
			return _userRemovedSignal;
		}
		
		/**
		 * Dispatched when a users' property have been changed
		 */
		private var _userChangeSignal:Signal = new Signal();
		
		public function get userChangeSignal():ISignal {
			return _userChangeSignal;
		}
		
		/**
		 * Get a user based on a UserId
		 *
		 * @param UserId
		 */
		public function getUserByUserId(userId:String):User {
			if (users != null) {
				for each (var user:User in users) {
					if (user.userId == userId) {
						return user;
					}
				}
			}
			return null;
		}
		
		/**
		 * Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
		 */
		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			var au:User = a as User, bu:User = b as User;
			/*if (a.presenter)
			   return -1;
			   else if (b.presenter)
			   return 1;*/
			if (au.role == User.MODERATOR && bu.role == User.MODERATOR) {
				// do nothing go to the end and check names
			} else if (au.role == User.MODERATOR)
				return -1;
			else if (bu.role == User.MODERATOR)
				return 1;
			else if ((User.EMOJI_STATUSES.indexOf(au.status) > -1) && (User.EMOJI_STATUSES.indexOf(bu.status) > -1)) {
				// do nothing go to the end and check names
			} else if (User.EMOJI_STATUSES.indexOf(au.status) > -1)
				return -1;
			else if (User.EMOJI_STATUSES.indexOf(au.status) > -1)
				return 1;
			else if (au.phoneUser && bu.phoneUser) {
			} else if (au.phoneUser)
				return -1;
			else if (bu.phoneUser)
				return 1;
			/**
			 * Check name (case-insensitive) in the event of a tie up above. If the name
			 * is the same then use userID which should be unique making the order the same
			 * across all clients.
			 */
			if (au.name.toLowerCase() < bu.name.toLowerCase())
				return -1;
			else if (au.name.toLowerCase() > bu.name.toLowerCase())
				return 1;
			else if (au.userId.toLowerCase() > bu.userId.toLowerCase())
				return -1;
			else if (au.userId.toLowerCase() < bu.userId.toLowerCase())
				return 1;
			return 0;
		}
		
		public function addUser(newuser:User):void {
			trace("Adding new user [" + newuser.userId + "]");
			if (!hasUser(newuser.userId)) {
				trace("Am I this new user [" + newuser.userId + ", " + _me.userId + "]");
				if (newuser.userId == _me.userId) {
					newuser.me = true;
					//TODO check if this is correct
					// if we don't set _me to the just added user, _me won't get any update ever, it wouldn't be
					// possible to use me.isModerator(), for instance
					newuser.listenOnly = _me.listenOnly;
					_me = newuser;
				}
				_users.addItem(newuser);
				_users.refresh();
				if (newuser.hasStream) {
					userChangeSignal.dispatch(newuser, HAS_STREAM);
				}
				if (newuser.presenter) {
					userChangeSignal.dispatch(newuser, PRESENTER);
				}
				if (newuser.listenOnly) {
					userChangeSignal.dispatch(newuser, LISTEN_ONLY);
				}
				userAddedSignal.dispatch(newuser);
			}
		}
		
		public function hasUser(userID:String):Boolean {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				return true;
			}
			return false;
		}
		
		public function getUser(userID:String):User {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				return p.participant as User;
			}
			return null;
		}
		
		public function getUserByVoiceUserId(voiceUserId:String):User {
			var aUser:User;
			for (var i:int = 0; i < _users.length; i++) {
				aUser = _users.getItemAt(i) as User;
				if (aUser.voiceUserId == voiceUserId) {
					return aUser;
				}
			}
			return null;
		}
		
		public function removeUser(userID:String):void {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				var user:User = p.participant as User;
				user.isLeavingFlag = true;
				trace("removing user[" + user.name + "," + user.userId + "]");
				_users.removeItemAt(p.index);
				_users.refresh();
				userRemovedSignal.dispatch(userID);
			}
		}
		
		/**
		 * Get the presenter user
		 * @return null if participant not found
		 *
		 */
		public function getPresenter():User {
			var u:User;
			for (var i:int = 0; i < _users.length; i++) {
				u = _users.getItemAt(i) as User;
				if (u.presenter)
					return u;
			}
			return null;
		}
		
		public function removePresenter(userID:String):void {
			var u:User = getPresenter();
			if (u.presenter) {
				u.presenter = false;
				userChangeSignal.dispatch(u, PRESENTER);
				if (u.me)
					_me.presenter = false;
			}
		}
		
		public function assignPresenter(userID:String):void {
			clearPresenter();
			var p:Object = getUserIndex(userID);
			if (p) {
				var user:User = p.participant as User;
				user.presenter = true;
				userChangeSignal.dispatch(user, PRESENTER);
				if (user.me)
					_me.presenter = true;
			}
		}
		
		private function clearPresenter():void {
			for each (var user:User in _users) {
				user.presenter = false;
				userChangeSignal.dispatch(user, PRESENTER);
			}
		}
		
		public function userStreamChange(userID:String, share:Boolean, streamName:String):void {
			var p:Object = getUserIndex(userID);
			if (p) {
				var user:User = p.participant as User;
				if (share) {
					user.hasStream = true;
					if (user.streamName == "") {
						user.streamName = streamName;
					} else if (user.streamName.indexOf(streamName) == -1) {
						user.streamName += "|" + streamName;
					}
				} else {
					var newStreamName:String = "";
					var streamNames:Array = user.streamName.split("|");
					if (streamName) {
						for each (var sN:String in streamNames) {
							if (streamName != sN) {
								if (newStreamName == "") {
									newStreamName += sN;
								} else {
									newStreamName += "|" + sN;
								}
							}
						}
					}
					user.streamName = newStreamName;
					if (newStreamName != "") {
						user.hasStream = true;
					} else {
						user.hasStream = false;
					}
				}
				userChangeSignal.dispatch(user, HAS_STREAM);
			}
		}
		
		public function statusChange(userID:String, value:String):void {
			var p:Object = getUserIndex(userID);
			if (p) {
				var user:User = p.participant as User;
				p.participant.status = value;
				userChangeSignal.dispatch(p.participant, STATUS);
			}
		}
		
		public function userJoinAudio(userID:String, voiceUserID:String, muted:Boolean, talking:Boolean, locked:Boolean):void {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				var user:User = p.participant as User;
				user.voiceUserId = voiceUserID;
				user.voiceJoined = true;
				user.muted = muted;
				user.talking = talking;
				userChangeSignal.dispatch(user, JOIN_AUDIO);
			} else {
				trace("UserList: User join audio failed - user not found");
			}
		}
		
		public function userLeaveAudio(userID:String):void {
			var user:User = getUser(userID);
			if (user != null) {
				user.talking = false;
				user.voiceJoined = false;
				userChangeSignal.dispatch(user, LEAVE_AUDIO);
			} else {
				trace("UserList: User leave audio failed - user not found");
			}
		}
		
		public function userMuteChange(voiceUserID:String, mute:Boolean):void {
			var user:User = getUserByVoiceUserId(voiceUserID);
			if (user != null) {
				user.muted = mute;
				if (mute) {
					user.talking = false;
				}
				userChangeSignal.dispatch(user, MUTE);
			}
		}
		
		public function userLockedChange(voiceUserID:String, locked:Boolean):void {
			var user:User = getUserByVoiceUserId(voiceUserID);
			if (user != null) {
				user.locked = locked;
				userChangeSignal.dispatch(user, LOCKED);
			}
		}
		
		public function userTalkingChange(voiceUserID:String, talking:Boolean):void {
			var user:User = getUserByVoiceUserId(voiceUserID);
			if (user != null) {
				user.talking = talking;
			}
			userChangeSignal.dispatch(user, TALKING);
		}
		
		/**
		 * Get the an object containing the index and User object for a specific userid
		 * @param userID
		 * @return null if userID id not found
		 *
		 */
		private function getUserIndex(userID:String):Object {
			var aUser:User;
			for (var i:int = 0; i < _users.length; i++) {
				aUser = _users.getItemAt(i) as User;
				if (aUser.userId == userID) {
					return {index: i, participant: aUser};
				}
			}
			return null;
		}
		
		public function listenOnlyChange(userID:String, listenOnly:Boolean):void {
			var user:User = getUser(userID);
			if (user != null) {
				user.listenOnly = listenOnly;
				userChangeSignal.dispatch(user, LISTEN_ONLY);
			}
		}
		
		public function removeAllUsers():void {
			_users = new ArrayCollection();
		}
	}
}
