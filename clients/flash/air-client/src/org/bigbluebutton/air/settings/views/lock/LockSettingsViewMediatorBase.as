package org.bigbluebutton.air.settings.views.lock {
	import org.bigbluebutton.air.main.models.IMeetingData;
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LockSettingsViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:LockSettingsViewBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		override public function initialize():void {
			loadLockSettings();
		}
		
		private function loadLockSettings():void {
			view.webcamCheckbox.selected = !meetingData.meetingStatus.lockSettings.disableCam;
			view.microphoneCheckbox.selected = !meetingData.meetingStatus.lockSettings.disableMic;
			view.privateChatCheckbox.selected = !meetingData.meetingStatus.lockSettings.disablePrivChat;
			view.publicChatCheckbox.selected = !meetingData.meetingStatus.lockSettings.disablePubChat;
			view.layoutCheckbox.selected = !meetingData.meetingStatus.lockSettings.lockedLayout;
		}
	
	}
}
