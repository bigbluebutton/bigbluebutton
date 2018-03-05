package org.bigbluebutton.air.settings.views.lock {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.main.commands.SaveLockSettingsSignal;
	import org.bigbluebutton.air.main.models.IUISession;
	
	public class LockSettingsViewMediatorAIR extends LockSettingsViewMediatorBase {
		
		[Inject]
		public var saveLockSettingsSignal:SaveLockSettingsSignal;
		
		[Inject]
		public var userUISession:IUISession;
		
		override public function initialize():void {
			super.initialize();
			// view.applyButton.addEventListener(MouseEvent.CLICK, onApply);
			// FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'lockSettings.title');
			// FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = true;
			// FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = false;
		}
		
		private function onApply(event:MouseEvent):void {
			var newLockSettings:Object = new Object();
			newLockSettings.disableCam = !view.webcamCheckbox.selected;
			newLockSettings.disableMic = !view.microphoneCheckbox.selected;
			newLockSettings.disablePrivateChat = !view.privateChatCheckbox.selected;
			newLockSettings.disablePublicChat = !view.publicChatCheckbox.selected;
			newLockSettings.lockedLayout = !view.layoutCheckbox.selected;
			newLockSettings.lockOnJoin = userSession.lockSettings.lockOnJoin;
			newLockSettings.lockOnJoinConfigurable = userSession.lockSettings.lockOnJoinConfigurable;
			saveLockSettingsSignal.dispatch(newLockSettings);
			userUISession.popPage();
		}
		
		override public function destroy():void {
			super.destroy();
			// view.applyButton.removeEventListener(MouseEvent.CLICK, onApply);
		}
	}
}
