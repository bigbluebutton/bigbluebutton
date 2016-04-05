package org.bigbluebutton.air.settings.views.split {
	
	import flash.events.Event;
	
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.views.SplitViewEvent;
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class SplitSettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:ISplitSettingsView;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function initialize():void {
			eventDispatcher.addEventListener(SplitViewEvent.CHANGE_VIEW, changeView);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			loadView();
		}
		
		private function loadView():void {
			var backFromRotation:Boolean = PageEnum.contain(userUISession.currentPageDetails as String);
			if (backFromRotation) {
				view.settingsNavigator.pushView(PageEnum.getClassfromName(userUISession.currentPageDetails as String));
			} else {
				view.settingsNavigator.pushView(PageEnum.getClassfromName(PageEnum.AUDIOSETTINGS));
			}
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			var tabletLandscape:Boolean = FlexGlobals.topLevelApplication.isTabletLandscape();
			if (!tabletLandscape) {
				userUISession.popPage();
				userUISession.pushPage(PageEnum.PROFILE);
				var pageName:String = view.settingsNavigator.activeView.className.replace('View', '');
				userUISession.pushPage(pageName);
			}
		}
		
		private function changeView(event:SplitViewEvent):void {
			view.settingsNavigator.pushView(event.view);
		}
		
		override public function destroy():void {
			super.destroy();
			eventDispatcher.removeEventListener(SplitViewEvent.CHANGE_VIEW, changeView);
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			view.dispose();
			view = null;
		}
	}
}
