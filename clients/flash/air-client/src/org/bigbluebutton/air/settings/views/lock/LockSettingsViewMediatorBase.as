package org.bigbluebutton.air.settings.views.lock {
	import org.bigbluebutton.air.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LockSettingsViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:LockSettingsViewBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			loadLockSettings();
		}
		
		private function loadLockSettings():void {
			view.webcamCheckbox.selected = !userSession.lockSettings.disableCam;
			view.microphoneCheckbox.selected = !userSession.lockSettings.disableMic;
			view.privateChatCheckbox.selected = !userSession.lockSettings.disablePrivateChat;
			view.publicChatCheckbox.selected = !userSession.lockSettings.disablePublicChat;
			view.layoutCheckbox.selected = !userSession.lockSettings.lockedLayout;
		}
	
	}
}
