package org.bigbluebutton.air.settings.views.audio {
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.settings.views.audio.AudioSettingsViewMediatorBase;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	public class AudioSettingsViewMediatorAIR extends AudioSettingsViewMediatorBase {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUISession;
		
		[Inject]
		public var saveData:ISaveData;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		private var micActivityTimer:Timer = null;
		
		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			var userMe:User = userSession.userList.me;
			
			// view.continueBtn.addEventListener(MouseEvent.CLICK, onContinueClick);
			view.audioToggle.addEventListener(Event.CHANGE, onEnableAudioClick);
			view.microhponeToggle.addEventListener(Event.CHANGE, onmicrohponeToggleClick);
			// view.enablePushToTalk.addEventListener(Event.CHANGE, onEnablePushToTalkClick);
			view.gainSlider.addEventListener(Event.CHANGE, gainChange);
			userSession.lockSettings.disableMicSignal.add(disableMic);
			disableMic(userSession.lockSettings.disableMic && userMe.role != User.MODERATOR && !userMe.presenter && userMe.locked);
			view.audioToggle.selected = (userMe.voiceJoined || userMe.listenOnly);
			// view.enablePushToTalk.enabled = view.microhponeToggle.selected = userMe.voiceJoined;
			// view.enablePushToTalk.selected = (userSession.pushToTalk || userSession.phoneOptions.autoJoin);
			loadMicGain();
			micActivityTimer = new Timer(100);
			micActivityTimer.addEventListener(TimerEvent.TIMER, micActivity);
			micActivityTimer.start();
			// view.continueBtn.visible = userSession.phoneOptions.autoJoin;
		}
		
		private function loadMicGain():void {
			var gain:Number = saveData.read("micGain") as Number;
			if (!isNaN(gain)) {
				view.gainSlider.value = gain / 10;
			}
		}
		
		
		private function setMicGain(gain:Number):void {
			if (userSession.voiceStreamManager) {
				userSession.voiceStreamManager.setDefaultMicGain(gain);
				if (!userSession.pushToTalk && userSession.voiceStreamManager.mic) {
					userSession.voiceStreamManager.mic.gain = gain;
				}
			}
		}
		
		
		private function gainChange(e:Event):void {
			var gain:Number = e.target.value * 10
			saveData.save("micGain", gain);
			setMicGain(gain);
		}
		
		
		private function micActivity(e:TimerEvent):void {
			//	if (userSession.voiceStreamManager && userSession.voiceStreamManager.mic) {
			//		view.micActivityMask.width = view.gainSlider.width - (view.gainSlider.width * userSession.voiceStreamManager.mic.activityLevel / 100);
			//		view.micActivityMask.x = view.micActivity.x + view.micActivity.width - view.micActivityMask.width;
			//	}
		}
		
		private function disableMic(disable:Boolean):void {
			if (disable) {
				view.microhponeToggle.enabled = false;
				view.microhponeToggle.selected = false;
			} else {
				view.microhponeToggle.enabled = true;
			}
		}
		
		
		private function onContinueClick(event:Event):void {
			userUISession.popPage();
		}
		
		
		private function onEnableAudioClick(event:Event):void {
			if (!view.audioToggle.selected) {
				view.microhponeToggle.selected = false;
				// view.enablePushToTalk.enabled = false;
				userSession.pushToTalk = false;
			}
			var audioOptions:Object = new Object();
			audioOptions.shareMic = userSession.userList.me.voiceJoined = view.microhponeToggle.selected && view.audioToggle.selected;
			audioOptions.listenOnly = userSession.userList.me.listenOnly = !view.microhponeToggle.selected && view.audioToggle.selected;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		
		private function onmicrohponeToggleClick(event:Event):void {
			// view.enablePushToTalk.enabled = view.microhponeToggle.selected;
			if (view.microhponeToggle.selected) {
				view.audioToggle.selected = true;
			}
			// userSession.pushToTalk = (view.enablePushToTalk.selected && view.enablePushToTalk.enabled);
			var audioOptions:Object = new Object();
			audioOptions.shareMic = userSession.userList.me.voiceJoined = view.microhponeToggle.selected && view.audioToggle.selected;
			audioOptions.listenOnly = userSession.userList.me.listenOnly = !view.microhponeToggle.selected && view.audioToggle.selected;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		// private function onEnablePushToTalkClick(event:Event):void {
		//	userSession.pushToTalk = view.enablePushToTalk.selected;
		// }
		
		private function userChangeHandler(user:User, type:int):void {
			if (user.me) {
				if (type == UserList.LISTEN_ONLY) {
					view.audioToggle.selected = user.voiceJoined || user.listenOnly;
					view.microhponeToggle.selected = user.voiceJoined;
				}
			}
		}
		
		override public function destroy():void {
			super.destroy();
			
			userSession.lockSettings.disableMicSignal.remove(disableMic);
			// view.continueBtn.removeEventListener(MouseEvent.CLICK, onContinueClick);
			view.audioToggle.removeEventListener(Event.CHANGE, onEnableAudioClick);
			view.microhponeToggle.removeEventListener(Event.CHANGE, onmicrohponeToggleClick);
			if (micActivityTimer) {
				// micActivityTimer.removeEventListener(TimerEvent.TIMER, micActivity);
			}
			// view.enablePushToTalk.removeEventListener(Event.CHANGE, onEnablePushToTalkClick);
			view.gainSlider.removeEventListener(Event.CHANGE, gainChange);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			userSession.phoneOptions.autoJoin = false;
		}
	
	}
}
