package org.bigbluebutton.air.settings.views.split {
	
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.StageOrientationEvent;
	import flash.utils.setTimeout;
	
	import mx.core.FlexGlobals;
	import mx.events.ItemClickEvent;
	import mx.events.ResizeEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.common.views.SplitViewEvent;
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
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
			var backFromRotation = PagesENUM.contain(userUISession.currentPageDetails as String);
			if (backFromRotation) {
				view.settingsNavigator.pushView(PagesENUM.getClassfromName(userUISession.currentPageDetails as String));
			} else {
				view.settingsNavigator.pushView(PagesENUM.getClassfromName(PagesENUM.AUDIOSETTINGS));
			}
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			var tabletLandscape = FlexGlobals.topLevelApplication.isTabletLandscape();
			if (!tabletLandscape) {
				userUISession.popPage();
				userUISession.pushPage(PagesENUM.PROFILE);
				var pageName:String = view.settingsNavigator.activeView.className.replace('View', '');
				userUISession.pushPage(pageName);
			}
		}
		
		private function changeView(event:SplitViewEvent) {
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
