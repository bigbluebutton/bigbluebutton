package org.bigbluebutton.lib.settings.views.audio {
	
	import flash.events.Event;
	
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.LockSettings2x;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.models.UserRole;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class AudioSettingsViewMediatorBase extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var saveData:ISaveData;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var view:AudioSettingsViewBase;
		
		override public function initialize():void {
			super.initialize();
			
			//var userMe:User = userSession.userList.me;
			//userSession.userList.userChangeSignal.add(userChangeHandler);
			meetingData.meetingStatus.lockSettingsChangeSignal.add(lockSettingsChange);
			lockSettingsChange(meetingData.meetingStatus.lockSettings);
			
			view.audioToggle.addEventListener(Event.CHANGE, onEnableAudioClick);
			view.microphoneToggle.addEventListener(Event.CHANGE, onMicrophoneToggleClick);
			view.gainSlider.addEventListener(Event.CHANGE, gainChange);
			
			//view.audioToggle.selected = (userMe.voiceJoined || userMe.listenOnly);
		}
		
		private function userChangeHandler(user:User2x, type:int):void {
			/*
			if (user.me) {
				if (type == UserList.LISTEN_ONLY) {
					view.audioToggle.selected = user.voiceJoined || user.listenOnly;
					view.microphoneToggle.selected = user.voiceJoined;
				}
			}
			*/
		}
		
		protected function lockSettingsChange(lockSettings:LockSettings2x):void {
			var me:User2x = meetingData.users.me;
			if (lockSettings.disableMic && me.role != UserRole.MODERATOR && me.locked) {
				view.microphoneToggle.enabled = false;
				view.microphoneToggle.selected = false;
			} else {
				view.microphoneToggle.enabled = true;
			}
		}
		
		private function onEnableAudioClick(event:Event):void {
			if (!view.audioToggle.selected) {
				view.microphoneToggle.selected = false;
				// view.enablePushToTalk.enabled = false;
				userSession.pushToTalk = false;
			}
			var audioOptions:Object = new Object();
			//audioOptions.shareMic = userSession.userList.me.voiceJoined = view.microphoneToggle.selected && view.audioToggle.selected;
			//audioOptions.listenOnly = userSession.userList.me.listenOnly = !view.microphoneToggle.selected && view.audioToggle.selected;
			//shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		
		private function onMicrophoneToggleClick(event:Event):void {
			// view.enablePushToTalk.enabled = view.microphoneToggle.selected;
			if (view.microphoneToggle.selected) {
				view.audioToggle.selected = true;
			}
			// userSession.pushToTalk = (view.enablePushToTalk.selected && view.enablePushToTalk.enabled);
			var audioOptions:Object = new Object();
			//audioOptions.shareMic = userSession.userList.me.voiceJoined = view.microphoneToggle.selected && view.audioToggle.selected;
			//audioOptions.listenOnly = userSession.userList.me.listenOnly = !view.microphoneToggle.selected && view.audioToggle.selected;
			//shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function gainChange(e:Event):void {
			var gain:Number = e.target.value * 10
			saveData.save("micGain", gain);
			setMicGain(gain);
		}
		
		private function setMicGain(gain:Number):void {
			if (userSession.voiceStreamManager) {
				userSession.voiceStreamManager.setDefaultMicGain(gain);
				if (!userSession.pushToTalk && userSession.voiceStreamManager.mic) {
					userSession.voiceStreamManager.mic.gain = gain;
				}
			}
		}
		
		override public function destroy():void {
			super.destroy();
			
			view.audioToggle.removeEventListener(Event.CHANGE, onEnableAudioClick);
			view.microphoneToggle.removeEventListener(Event.CHANGE, onMicrophoneToggleClick);
			view.gainSlider.removeEventListener(Event.CHANGE, gainChange);
			
			meetingData.meetingStatus.lockSettingsChangeSignal.remove(lockSettingsChange);
			//userSession.userList.userChangeSignal.remove(userChangeHandler);
		}
	}
}
