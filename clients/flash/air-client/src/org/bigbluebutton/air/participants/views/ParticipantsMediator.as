package org.bigbluebutton.air.participants.views {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.air.chat.events.ChatRoomItemSelectedEvent;
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.chat.models.GroupChatChangeEnum;
	import org.bigbluebutton.air.chat.models.IChatMessagesSession;
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.LockSettings2x;
	import org.bigbluebutton.air.participants.models.CollectionActionResult;
	import org.bigbluebutton.air.participants.models.CollectionUpdateAction;
	import org.bigbluebutton.air.participants.models.ParticipantsCollection;
	import org.bigbluebutton.air.user.events.UserItemSelectedEvent;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.models.UserChangeEnum;
	import org.bigbluebutton.air.user.views.models.UserVM;
	import org.bigbluebutton.air.user.views.models.UsersVMCollection;
	import org.bigbluebutton.air.video.models.WebcamChangeEnum;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	import org.bigbluebutton.air.voice.models.VoiceUserChangeEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ParticipantsMediator extends Mediator {
		
		[Inject]
		public var view:ParticipantsViewBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Bindable]
		private var _userCollection:UsersVMCollection;
		
		[Bindable]
		private var _participantsCollection:ParticipantsCollection;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			initializeParticipantsCollection();
			
			meetingData.users.userChangeSignal.add(onUserChange);
			meetingData.meetingStatus.lockSettingsChangeSignal.add(onLockSettingsChange);
			meetingData.voiceUsers.userChangeSignal.add(onVoiceUserChange);
			meetingData.webcams.webcamChangeSignal.add(onWebcamChange);
			
			chatMessagesSession.groupChatChangeSignal.add(onGroupChatChange)
			
			view.participantsList.addEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
			view.participantsList.addEventListener(ChatRoomItemSelectedEvent.SELECTED, onChatItemSelected);
		}
		
		private function initializeParticipantsCollection():void {
			initializeUserCollection();
			_participantsCollection = new ParticipantsCollection();
			_participantsCollection.initUsers(_userCollection);
			_participantsCollection.initGroupChats(chatMessagesSession.chats);
			_participantsCollection.refresh();
			view.participantsList.dataProvider = _participantsCollection;
		}
		
		private function initializeUserCollection():void {
			_userCollection = new UsersVMCollection();
			_userCollection.setRoomLockState(meetingData.meetingStatus.lockSettings.isRoomLocked());
			_userCollection.addUsers(meetingData.users.getUsers());
			_userCollection.addVoiceUsers(meetingData.voiceUsers.getAll());
			_userCollection.addWebcams(meetingData.webcams.getAll());
		}
		
		private function onUserChange(user:User2x, property:int):void {
			switch (property) {
				case UserChangeEnum.JOIN:
					var addResult:CollectionActionResult = _userCollection.addUser(user);
					_participantsCollection.addUser(addResult.item as UserVM);
					break;
				case UserChangeEnum.LEAVE:
					var removeResult:CollectionActionResult = _userCollection.removeUser(user);
					_participantsCollection.removeUser(removeResult.item as UserVM);
					break;
				case UserChangeEnum.ROLE:
					_userCollection.updateRole(user);
					break;
				case UserChangeEnum.PRESENTER:
					_userCollection.updatePresenter(user);
					break;
				case UserChangeEnum.LOCKED:
					_userCollection.updateUserLock(user);
					break;
				case UserChangeEnum.EMOJI:
					_userCollection.updateEmoji(user);
					break;
			}
			_participantsCollection.refresh();
		}
		
		private function onVoiceUserChange(voiceUser:VoiceUser, enum:int):void {
			switch (enum) {
				case VoiceUserChangeEnum.JOIN:
					var addResult:CollectionActionResult = _userCollection.addVoiceUser(voiceUser);
					if (addResult.action == CollectionUpdateAction.ADD) {
						_participantsCollection.addUser(addResult.item as UserVM);
					}
					break;
				case VoiceUserChangeEnum.LEAVE:
					_userCollection.removeVoiceUser(voiceUser);
					if (addResult.action == CollectionUpdateAction.DELETE) {
						_participantsCollection.removeUser(addResult.item as UserVM);
					}
					break;
				case VoiceUserChangeEnum.MUTE:
					_userCollection.updateMute(voiceUser);
					break;
				case VoiceUserChangeEnum.TALKING:
					_userCollection.updateTalking(voiceUser);
					break;
			}
			_participantsCollection.refresh();
		}
		
		private function onWebcamChange(webcam:WebcamStreamInfo, enum:int):void {
			switch (enum) {
				case WebcamChangeEnum.ADD:
					_userCollection.addWebcam(webcam);
					break
				case WebcamChangeEnum.REMOVE:
					_userCollection.removeWebcam(webcam);
					break;
			}
		}
		
		private function onGroupChatChange(groupChat:GroupChat, enum:int):void {
			switch (enum) {
				case GroupChatChangeEnum.ADD:
					_participantsCollection.addGroupChat(groupChat);
					break;
				default:
					break;
			}
			_participantsCollection.refresh();
		}
		
		private function onLockSettingsChange(newLockSettings:LockSettings2x):void {
			_userCollection.setRoomLockState(newLockSettings.isRoomLocked());
		}
		
		protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			uiSession.pushPage(PageEnum.USER_DETAILS, e.user.intId);
		}
		
		private function onChatItemSelected(e:ChatRoomItemSelectedEvent):void {
			uiSession.pushPage(PageEnum.CHAT, {chatId: e.chatRoom.chatId});
		}
		
		override public function destroy():void {
			meetingData.users.userChangeSignal.remove(onUserChange);
			meetingData.meetingStatus.lockSettingsChangeSignal.remove(onLockSettingsChange);
			meetingData.voiceUsers.userChangeSignal.remove(onVoiceUserChange);
			meetingData.webcams.webcamChangeSignal.remove(onWebcamChange);
			
			chatMessagesSession.groupChatChangeSignal.remove(onGroupChatChange)
			
			view.participantsList.removeEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
			view.participantsList.removeEventListener(ChatRoomItemSelectedEvent.SELECTED, onChatItemSelected);
			
			super.destroy();
			view = null;
		}
	}
}
