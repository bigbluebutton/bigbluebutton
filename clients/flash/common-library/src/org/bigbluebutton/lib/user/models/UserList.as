package org.bigbluebutton.lib.user.models {
	
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	
	import spark.collections.Sort;
	
	public class UserList {
		public static const MODERATOR:int = 0;
		
		public static const HAS_STREAM:int = 1;
		
		public static const PRESENTER:int = 2;
		
		public static const JOIN_AUDIO:int = 3;
		
		public static const MUTE:int = 4;
		
		public static const TALKING:int = 5;
		
		public static const RAISE_HAND:int = 6;
		
		public static const LOCKED:int = 7;
		
		public static const LISTEN_ONLY:int = 8;
		
		public static const AGREE:int = 9;
		
		public static const NO_STATUS:int = 10;
		
		public static const DISAGREE:int = 11;
		
		public static const SPEAK_LOUDER:int = 12;
		
		public static const SPEAK_LOWER:int = 13;
		
		public static const SPEAK_FASTER:int = 14;
		
		public static const SPEAK_SLOWER:int = 15;
		
		public static const BE_RIGHT_BACK:int = 16;
		
		public static const LAUGHTER:int = 17;
		
		public static const SAD:int = 18;
		
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
					if (user.userID == userId) {
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
			else if ((au.status == User.RAISE_HAND) && (bu.status == User.RAISE_HAND)) {
				// do nothing go to the end and check names
			} else if ((au.status == User.RAISE_HAND))
				return -1;
			else if ((bu.status == User.RAISE_HAND))
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
			else if (au.userID.toLowerCase() > bu.userID.toLowerCase())
				return -1;
			else if (au.userID.toLowerCase() < bu.userID.toLowerCase())
				return 1;
			return 0;
		}
		
		public function addUser(newuser:User):void {
			trace("Adding new user [" + newuser.userID + "]");
			if (!hasUser(newuser.userID)) {
				trace("Am I this new user [" + newuser.userID + ", " + _me.userID + "]");
				if (newuser.userID == _me.userID) {
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
				if (newuser.status == User.RAISE_HAND) {
					userChangeSignal.dispatch(newuser, RAISE_HAND);
				}
				if (newuser.status == User.AGREE) {
					userChangeSignal.dispatch(newuser, AGREE);
				}
				if (newuser.status == User.DISAGREE) {
					userChangeSignal.dispatch(newuser, DISAGREE);
				}
				if (newuser.status == User.SPEAK_LOUDER) {
					userChangeSignal.dispatch(newuser, SPEAK_LOUDER);
				}
				if (newuser.status == User.SPEAK_LOWER) {
					userChangeSignal.dispatch(newuser, SPEAK_LOWER);
				}
				if (newuser.status == User.SPEAK_FASTER) {
					userChangeSignal.dispatch(newuser, SPEAK_FASTER);
				}
				if (newuser.status == User.SPEAK_SLOWER) {
					userChangeSignal.dispatch(newuser, SPEAK_SLOWER);
				}
				if (newuser.status == User.BE_RIGHT_BACK) {
					userChangeSignal.dispatch(newuser, BE_RIGHT_BACK);
				}
				if (newuser.status == User.LAUGHTER) {
					userChangeSignal.dispatch(newuser, LAUGHTER);
				}
				if (newuser.status == User.SAD) {
					userChangeSignal.dispatch(newuser, SAD);
				}
				if (newuser.status == User.NO_STATUS) {
					userChangeSignal.dispatch(newuser, NO_STATUS);
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
				trace("removing user[" + user.name + "," + user.userID + "]");
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
					} else {
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
				switch (value) {
					case User.RAISE_HAND:
						userChangeSignal.dispatch(p.participant, RAISE_HAND);
						break;
					case User.AGREE:
						userChangeSignal.dispatch(p.participant, AGREE);
						break;
					case User.DISAGREE:
						userChangeSignal.dispatch(p.participant, DISAGREE);
						break;
					case User.SPEAK_LOUDER:
						userChangeSignal.dispatch(p.participant, SPEAK_LOUDER);
						break;
					case User.SPEAK_LOWER:
						userChangeSignal.dispatch(p.participant, SPEAK_LOWER);
						break;
					case User.SPEAK_FASTER:
						userChangeSignal.dispatch(p.participant, SPEAK_FASTER);
						break;
					case User.SPEAK_SLOWER:
						userChangeSignal.dispatch(p.participant, SPEAK_SLOWER);
						break;
					case User.BE_RIGHT_BACK:
						userChangeSignal.dispatch(p.participant, BE_RIGHT_BACK);
						break;
					case User.LAUGHTER:
						userChangeSignal.dispatch(p.participant, LAUGHTER);
						break;
					case User.SAD:
						userChangeSignal.dispatch(p.participant, SAD);
						break;
					case User.NO_STATUS:
						userChangeSignal.dispatch(p.participant, NO_STATUS);
				}
			}
		}
		
		public function roleChange(userID:String, role:String):void {
			var p:Object = getUserIndex(userID);
			if (p) {
				var user:User = p.participant as User;
				p.participant.role = role;
				userChangeSignal.dispatch(p.participant, role);
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
				userChangeSignal.dispatch(user, JOIN_AUDIO);
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
				if (aUser.userID == userID) {
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
		
		public function removeAllUsers() {
			_users = new ArrayCollection();
		}
	}
}
