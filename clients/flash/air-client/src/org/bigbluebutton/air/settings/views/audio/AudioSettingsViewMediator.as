package org.bigbluebutton.air.settings.views.audio {
	
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class AudioSettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:IAudioSettingsView;
		
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
			FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'audioSettings.title');
			var userMe:User = userSession.userList.me;
			view.continueBtn.addEventListener(MouseEvent.CLICK, onContinueClick);
			view.enableAudio.addEventListener(Event.CHANGE, onEnableAudioClick);
			view.enableMic.addEventListener(Event.CHANGE, onEnableMicClick);
			view.enablePushToTalk.addEventListener(Event.CHANGE, onEnablePushToTalkClick);
			view.gainSlider.addEventListener(Event.CHANGE, gainChange);
			userSession.lockSettings.disableMicSignal.add(disableMic);
			disableMic(userSession.lockSettings.disableMic && userMe.role != User.MODERATOR && !userMe.presenter && userMe.locked);
			view.enableAudio.selected = (userMe.voiceJoined || userMe.listenOnly);
			view.enablePushToTalk.enabled = view.enableMic.selected = userMe.voiceJoined;
			view.enablePushToTalk.selected = (userSession.pushToTalk || userSession.phoneOptions.autoJoin);
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = true;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = false;
			loadMicGain();
			micActivityTimer = new Timer(100);
			micActivityTimer.addEventListener(TimerEvent.TIMER, micActivity);
			micActivityTimer.start();
			view.continueBtn.visible = userSession.phoneOptions.autoJoin;
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
			if (userSession.voiceStreamManager && userSession.voiceStreamManager.mic) {
				view.micActivityMask.width = view.gainSlider.width - (view.gainSlider.width * userSession.voiceStreamManager.mic.activityLevel / 100);
				view.micActivityMask.x = view.micActivity.x + view.micActivity.width - view.micActivityMask.width;
			}
		}
		
		private function disableMic(disable:Boolean):void {
			if (disable) {
				view.enableMic.enabled = false;
				view.enableMic.selected = false;
			} else {
				view.enableMic.enabled = true;
			}
		}
		
		private function onContinueClick(event:Event):void {
			userUISession.popPage();
		}
		
		private function onEnableAudioClick(event:Event):void {
			if (!view.enableAudio.selected) {
				view.enableMic.selected = false;
				view.enablePushToTalk.enabled = false;
				userSession.pushToTalk = false;
			}
			var audioOptions:Object = new Object();
			audioOptions.shareMic = userSession.userList.me.voiceJoined = view.enableMic.selected && view.enableAudio.selected;
			audioOptions.listenOnly = userSession.userList.me.listenOnly = !view.enableMic.selected && view.enableAudio.selected;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function onEnableMicClick(event:Event):void {
			view.enablePushToTalk.enabled = view.enableMic.selected;
			if (view.enableMic.selected) {
				view.enableAudio.selected = true;
			}
			userSession.pushToTalk = (view.enablePushToTalk.selected && view.enablePushToTalk.enabled);
			var audioOptions:Object = new Object();
			audioOptions.shareMic = userSession.userList.me.voiceJoined = view.enableMic.selected && view.enableAudio.selected;
			audioOptions.listenOnly = userSession.userList.me.listenOnly = !view.enableMic.selected && view.enableAudio.selected;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function onEnablePushToTalkClick(event:Event):void {
			userSession.pushToTalk = view.enablePushToTalk.selected;
		}
		
		private function userChangeHandler(user:User, type:int):void {
			if (user.me) {
				if (type == UserList.LISTEN_ONLY) {
					view.enableAudio.selected = user.voiceJoined || user.listenOnly;
					view.enableMic.selected = user.voiceJoined;
				}
			}
		}
		
		override public function destroy():void {
			super.destroy();
			userSession.lockSettings.disableMicSignal.remove(disableMic);
			view.continueBtn.removeEventListener(MouseEvent.CLICK, onContinueClick);
			view.enableAudio.removeEventListener(Event.CHANGE, onEnableAudioClick);
			view.enableMic.removeEventListener(Event.CHANGE, onEnableMicClick);
			if (micActivityTimer) {
				micActivityTimer.removeEventListener(TimerEvent.TIMER, micActivity);
			}
			view.enablePushToTalk.removeEventListener(Event.CHANGE, onEnablePushToTalkClick);
			view.gainSlider.removeEventListener(Event.CHANGE, gainChange);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			userSession.phoneOptions.autoJoin = false;
		}
	}
}
