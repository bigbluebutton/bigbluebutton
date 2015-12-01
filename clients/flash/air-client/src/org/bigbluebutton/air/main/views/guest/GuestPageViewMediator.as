package org.bigbluebutton.air.main.views.guest {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.system.Capabilities;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class GuestPageViewMediator extends Mediator {
		
		[Inject]
		public var view:IGuestPageView;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function initialize():void {
			// If operating system is iOS, don't show exit button because there is no way to exit application:
			if (Capabilities.version.indexOf('IOS') >= 0) {
				view.exitButton.visible = false;
			} else {
				view.exitButton.addEventListener(MouseEvent.CLICK, applicationExit);
			}
			FlexGlobals.topLevelApplication.pageName.text = "";
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
		}
		
		private function applicationExit(event:Event):void {
			NativeApplication.nativeApplication.exit();
		}
	}
}
