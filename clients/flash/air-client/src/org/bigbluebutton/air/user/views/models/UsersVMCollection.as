package org.bigbluebutton.air.user.views.models {
	import mx.collections.ArrayCollection;
	import mx.collections.Sort;
	
	import org.bigbluebutton.air.user.models.EmojiStatus;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.models.UserRole;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	
	public class UsersVMCollection extends ArrayCollection {
		private var _quickLookup:Object;
		
		private var _roomLocked:Boolean = false;
		
		
		public function UsersVMCollection(source:Array = null) {
			super(source);
			
			_quickLookup = new Object();
			
			sort = new Sort(null, sortFunction);
		}
		
		public function addUsers(users:Array):void {
			for each (var user:User2x in users) {
				addUser(user, true);
			}
		}
		
		public function addUser(user:User2x, initLoad:Boolean = false):void {
			var userVM:UserVM = new UserVM();
			userVM.intId = user.intId;
			userVM.extId = user.extId;
			userVM.name = user.name;
			userVM.role = user.role;
			userVM.presenter = user.presenter;
			userVM.locked = user.locked;
			userVM.avatarURL = user.avatar;
			userVM.emoji = user.emoji;
			userVM.me = user.me;
			
			userVM.roomLocked = _roomLocked;
			
			//webcam state updated later
			
			addItem(userVM);
			_quickLookup[userVM.intId] = userVM;
			
			if (!initLoad)
				refresh();
		}
		
		public function removeUser(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				delete _quickLookup[userVM.intId];
				removeItem(userVM);
			}
		}
		
		public function updateRole(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.role = user.role;
				refresh();
			}
		}
		
		public function updatePresenter(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.presenter = user.presenter;
				refresh();
			}
		}
		
		public function updateUserLock(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.locked = user.locked;
				refresh();
			}
		}
		
		public function updateEmoji(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.emoji = user.emoji;
				refresh();
			}
		}
		
		public function addVoiceUsers(voiceUsers:Array):void {
			for each (var vUser:VoiceUser in voiceUsers) {
				addVoiceUser(vUser, true);
			}
		}
		
		public function addVoiceUser(voiceUser:VoiceUser, initLoad:Boolean = false):void {
			var userVM:UserVM = findUser(voiceUser.intId);
			if (userVM) {
				userVM.voiceOnly = false;
			} else {
				userVM = new UserVM();
				userVM.intId = voiceUser.intId;
				userVM.name = voiceUser.callerName;
				userVM.voiceOnly = false;
				
				addItem(userVM);
				_quickLookup[voiceUser.intId] = userVM;
			}
			
			userVM.inVoiceConf = true;
			userVM.talking = voiceUser.talking;
			userVM.muted = voiceUser.muted;
			userVM.listenOnly = voiceUser.listenOnly;
			
			if (!initLoad) {
				refresh();
			}
		}
		
		public function removeVoiceUser(voiceUser:VoiceUser):void {
			var userVM:UserVM = findUser(voiceUser.intId);
			if (userVM) {
				// if voice only remove whole thing
				if (userVM.voiceOnly) {
					removeItem(userVM);
					delete _quickLookup[userVM.intId];
				} else {
					userVM.inVoiceConf = false;
					userVM.talking = false;
					userVM.muted = false;
					userVM.listenOnly = false;
				}
				refresh();
			}
		}
		
		public function updateMute(voiceUser:VoiceUser):void {
			var userVM:UserVM = findUser(voiceUser.intId);
			if (userVM) {
				userVM.muted = voiceUser.muted;
				userVM.talking = voiceUser.talking;
				refresh();
			}
		}
		
		public function updateTalking(voiceUser:VoiceUser):void {
			var userVM:UserVM = findUser(voiceUser.intId);
			if (userVM) {
				userVM.talking = voiceUser.talking;
				refresh();
			}
		}
		
		public function addWebcams(webcams:Array):void {
			for each (var webcam:WebcamStreamInfo in webcams) {
				addWebcam(webcam, true);
			}
		}
		
		public function addWebcam(info:WebcamStreamInfo, initLoad:Boolean = false):void {
			var userVM:UserVM = findUser(info.userId);
			if (userVM) {
				userVM.webcamStreams.push(info.streamId);
				
				if (!initLoad)
					refresh();
			}
		}
		
		public function removeWebcam(info:WebcamStreamInfo):void {
			var userVM:UserVM = findUser(info.userId);
			if (userVM) {
				var findStreamIndex:int = userVM.webcamStreams.indexOf(info.streamId);
				if (findStreamIndex != -1) {
					userVM.webcamStreams.removeAt(findStreamIndex);
					
					if (userVM.webcamStreams.length == 0) {
						refresh();
					}
				}
			}
		}
		
		public function setRoomLockState(locked:Boolean):void {
			_roomLocked = locked;
			
			for each (var user:UserVM in source) {
				user.roomLocked = locked;
			}
			
			refresh();
		}
		
		private function findUser(intId:String):UserVM {
			if (_quickLookup.propertyIsEnumerable(intId)) {
				return _quickLookup[intId];
			} else {
				return null;
			}
		}
		
		/**
		 * Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
		 */
		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			var au:UserVM = a as UserVM, bu:UserVM = b as UserVM;
			/*if (a.presenter)
			   return -1;
			   else if (b.presenter)
			   return 1;*/
			if (au.role == UserRole.MODERATOR && bu.role == UserRole.MODERATOR) {
				// do nothing go to the end and check names
			} else if (au.role == UserRole.MODERATOR)
				return -1;
			else if (bu.role == UserRole.MODERATOR)
				return 1;
			else if ((EmojiStatus.STATUS_ARRAY.indexOf(au.emoji) > -1) && (EmojiStatus.STATUS_ARRAY.indexOf(bu.emoji) > -1)) {
				// do nothing go to the end and check names
			} else if (EmojiStatus.STATUS_ARRAY.indexOf(au.emoji) > -1)
				return -1;
			else if (EmojiStatus.STATUS_ARRAY.indexOf(au.emoji) > -1)
				return 1;
			else if (au.voiceOnly && bu.voiceOnly) {
			} else if (au.voiceOnly)
				return -1;
			else if (bu.voiceOnly)
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
			else if (au.intId.toLowerCase() > bu.intId.toLowerCase())
				return -1;
			else if (au.intId.toLowerCase() < bu.intId.toLowerCase())
				return 1;
			return 0;
		}
	}
}
