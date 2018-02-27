package org.bigbluebutton.air.settings.views.audio {
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.settings.views.audio.AudioSettingsViewMediatorBase;
	import org.bigbluebutton.lib.user.models.User2x;
	
	public class AudioSettingsViewMediatorAIR extends AudioSettingsViewMediatorBase {
		
		[Inject]
		public var userUISession:IUISession;
		
		private var micActivityTimer:Timer = null;
		
		override public function initialize():void {
			super.initialize();
			var userMe:User2x = meetingData.users.me;
			
			// view.continueBtn.addEventListener(MouseEvent.CLICK, onContinueClick);
			// view.enablePushToTalk.addEventListener(Event.CHANGE, onEnablePushToTalkClick);
			// view.enablePushToTalk.enabled = view.microphoneToggle.selected = userMe.voiceJoined;
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
		
		private function micActivity(e:TimerEvent):void {
			//	if (userSession.voiceStreamManager && userSession.voiceStreamManager.mic) {
			//		view.micActivityMask.width = view.gainSlider.width - (view.gainSlider.width * userSession.voiceStreamManager.mic.activityLevel / 100);
			//		view.micActivityMask.x = view.micActivity.x + view.micActivity.width - view.micActivityMask.width;
			//	}
		}
		
		
		private function onContinueClick(event:Event):void {
			userUISession.popPage();
		}
		
		// private function onEnablePushToTalkClick(event:Event):void {
		//	userSession.pushToTalk = view.enablePushToTalk.selected;
		// }
		
		override public function destroy():void {
			super.destroy();
			
			// view.continueBtn.removeEventListener(MouseEvent.CLICK, onContinueClick);
			if (micActivityTimer) {
				micActivityTimer.removeEventListener(TimerEvent.TIMER, micActivity);
			}
			// view.enablePushToTalk.removeEventListener(Event.CHANGE, onEnablePushToTalkClick);
			userSession.phoneOptions.autoJoin = false;
		}
	
	}
}
