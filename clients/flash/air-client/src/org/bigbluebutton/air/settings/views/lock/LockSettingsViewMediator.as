package org.bigbluebutton.air.settings.views.lock {
	
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.StageOrientationEvent;
	
	import mx.core.FlexGlobals;
	import mx.events.ItemClickEvent;
	import mx.events.ResizeEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LockSettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:ILockSettingsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		private var _disableCam:Boolean;
		
		private var _disableMic:Boolean;
		
		private var _disablePublicChat:Boolean;
		
		private var _disablePrivateChat:Boolean;
		
		private var layout:Boolean;
		
		override public function initialize():void {
			loadLockSettings();
			view.applyButton.addEventListener(MouseEvent.CLICK, onApply);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'lockSettings.title');
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.backBtn.visible = true;
			FlexGlobals.topLevelApplication.profileBtn.visible = false;
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			var tabletLandscape = FlexGlobals.topLevelApplication.isTabletLandscape();
			if (tabletLandscape) {
				userUISession.popPage();
				userUISession.popPage();
				userUISession.pushPage(PagesENUM.SPLITSETTINGS, PagesENUM.LOCKSETTINGS);
			}
		}
		
		private function onApply(event:MouseEvent):void {
			var newLockSettings:Object = new Object();
			newLockSettings.disableCam = !view.cameraSwitch.selected;
			newLockSettings.disableMic = !view.micSwitch.selected;
			newLockSettings.disablePrivateChat = !view.privateChatSwitch.selected;
			newLockSettings.disablePublicChat = !view.publicChatSwitch.selected;
			newLockSettings.lockedLayout = !view.layoutSwitch.selected;
			userService.saveLockSettings(newLockSettings);
			userUISession.popPage();
			if (!FlexGlobals.topLevelApplication.isTabletLandscape()) {
				userUISession.popPage();
			}
		}
		
		private function loadLockSettings() {
			view.cameraSwitch.selected = !userSession.lockSettings.disableCam;
			view.micSwitch.selected = !userSession.lockSettings.disableMic;
			view.publicChatSwitch.selected = !userSession.lockSettings.disablePublicChat;
			view.privateChatSwitch.selected = !userSession.lockSettings.disablePrivateChat;
			view.layoutSwitch.selected = !userSession.lockSettings.lockedLayout;
		}
		
		override public function destroy():void {
			super.destroy();
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
		}
	}
}
