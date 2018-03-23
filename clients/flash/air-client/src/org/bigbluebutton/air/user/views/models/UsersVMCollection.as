package org.bigbluebutton.air.user.views.models {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.air.participants.models.CollectionActionResult;
	import org.bigbluebutton.air.participants.models.CollectionUpdateAction;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	
	public class UsersVMCollection extends ArrayCollection {
		private var _quickLookup:Object;
		
		private var _roomLocked:Boolean = false;
		
		
		public function UsersVMCollection(source:Array = null) {
			super(source);
			
			_quickLookup = new Object();
		}
		
		public function addUsers(users:Array):void {
			for each (var user:User2x in users) {
				addUser(user, true);
			}
		}
		
		public function addUser(user:User2x, initLoad:Boolean = false):CollectionActionResult {
			var userVM:UserVM = new UserVM();
			userVM.intId = user.intId;
			userVM.extId = user.extId;
			userVM.name = user.name;
			userVM.role = user.role;
			userVM.presenter = user.presenter;
			userVM.locked = user.locked;
			userVM.avatarURL = user.avatar;
			userVM.emoji = user.emoji;
			userVM.emojiStatusTime = user.emojiStatusTime;
			userVM.me = user.me;
			
			userVM.roomLocked = _roomLocked;
			
			//webcam state updated later
			
			addItem(userVM);
			_quickLookup[userVM.intId] = userVM;
			
			return new CollectionActionResult(CollectionUpdateAction.ADD, userVM);
		}
		
		public function removeUser(user:User2x):CollectionActionResult {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				delete _quickLookup[userVM.intId];
				removeItem(userVM);
				return new CollectionActionResult(CollectionUpdateAction.DELETE, userVM);
			}
			return null;
		}
		
		public function updateRole(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.role = user.role;
			}
		}
		
		public function updatePresenter(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.presenter = user.presenter;
			}
		}
		
		public function updateUserLock(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.locked = user.locked;
			}
		}
		
		public function updateEmoji(user:User2x):void {
			var userVM:UserVM = findUser(user.intId);
			if (userVM) {
				userVM.emoji = user.emoji;
			}
		}
		
		public function addVoiceUsers(voiceUsers:Array):void {
			for each (var vUser:VoiceUser in voiceUsers) {
				addVoiceUser(vUser, true);
			}
		}
		
		public function addVoiceUser(voiceUser:VoiceUser, initLoad:Boolean = false):CollectionActionResult {
			var userVM:UserVM = findUser(voiceUser.intId);
			var userInitiallyExists:Boolean = userVM != null;
			if (userVM) {
				userVM.voiceOnly = false;
			} else {
				userVM = new UserVM();
				userVM.intId = voiceUser.intId;
				userVM.name = voiceUser.callerName;
				userVM.voiceOnly = true;
				
				addItem(userVM);
				_quickLookup[voiceUser.intId] = userVM;
			}
			
			userVM.inVoiceConf = true;
			userVM.talking = voiceUser.talking;
			userVM.muted = voiceUser.muted;
			userVM.listenOnly = voiceUser.listenOnly;
			
			return new CollectionActionResult(userInitiallyExists ? CollectionUpdateAction.UPDATE : CollectionUpdateAction.ADD, userVM);
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
			}
		}
		
		public function updateMute(voiceUser:VoiceUser):void {
			var userVM:UserVM = findUser(voiceUser.intId);
			if (userVM) {
				userVM.muted = voiceUser.muted;
				userVM.talking = voiceUser.talking;
			}
		}
		
		public function updateTalking(voiceUser:VoiceUser):void {
			var userVM:UserVM = findUser(voiceUser.intId);
			if (userVM) {
				userVM.talking = voiceUser.talking;
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
			}
		}
		
		public function removeWebcam(info:WebcamStreamInfo):void {
			var userVM:UserVM = findUser(info.userId);
			if (userVM) {
				var findStreamIndex:int = userVM.webcamStreams.indexOf(info.streamId);
				if (findStreamIndex != -1) {
					userVM.webcamStreams.removeAt(findStreamIndex);
				}
			}
		}
		
		public function setRoomLockState(locked:Boolean):void {
			_roomLocked = locked;
			
			for each (var user:UserVM in source) {
				user.roomLocked = locked;
			}
		}
		
		private function findUser(intId:String):UserVM {
			if (_quickLookup.propertyIsEnumerable(intId)) {
				return _quickLookup[intId];
			} else {
				return null;
			}
		}
	}
}
