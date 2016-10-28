package org.bigbluebutton.air.settings.views.lock {
	
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.commands.SaveLockSettingsSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LockSettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:ILockSettingsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var saveLockSettingsSignal:SaveLockSettingsSignal;
		
		[Inject]
		public var userUISession:IUISession;
		
		override public function initialize():void {
			loadLockSettings();
			view.applyButton.addEventListener(MouseEvent.CLICK, onApply);
			FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'lockSettings.title');
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = true;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = false;
		}
		
		private function onApply(event:MouseEvent):void {
			var newLockSettings:Object = new Object();
			newLockSettings.disableCam = !view.cameraSwitch.selected;
			newLockSettings.disableMic = !view.micSwitch.selected;
			newLockSettings.disablePrivateChat = !view.privateChatSwitch.selected;
			newLockSettings.disablePublicChat = !view.publicChatSwitch.selected;
			newLockSettings.lockedLayout = !view.layoutSwitch.selected;
			newLockSettings.lockOnJoin = userSession.lockSettings.lockOnJoin;
			newLockSettings.lockOnJoinConfigurable = userSession.lockSettings.lockOnJoinConfigurable;
			saveLockSettingsSignal.dispatch(newLockSettings);
			userUISession.popPage();
		}
		
		private function loadLockSettings():void {
			view.cameraSwitch.selected = !userSession.lockSettings.disableCam;
			view.micSwitch.selected = !userSession.lockSettings.disableMic;
			view.publicChatSwitch.selected = !userSession.lockSettings.disablePublicChat;
			view.privateChatSwitch.selected = !userSession.lockSettings.disablePrivateChat;
			view.layoutSwitch.selected = !userSession.lockSettings.lockedLayout;
		}
		
		override public function destroy():void {
			super.destroy();
			view.applyButton.removeEventListener(MouseEvent.CLICK, onApply);
		}
	}
}
