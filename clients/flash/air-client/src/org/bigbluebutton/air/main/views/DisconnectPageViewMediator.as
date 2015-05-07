package org.bigbluebutton.air.main.views {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.system.Capabilities;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.lib.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.main.utils.DisconnectType;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class DisconnectPageViewMediator extends Mediator {
		
		[Inject]
		public var view:IDisconnectPageView;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function initialize():void {
			// If operating system is iOS, don't show exit button because there is no way to exit application:
			if (Capabilities.os.search("iPhone") >= 0) {
				view.exitButton.visible = false;
			} else {
				view.exitButton.addEventListener(MouseEvent.CLICK, applicationExit);
			}
			changeConnectionStatus(userUISession.currentPageDetails as int);
			FlexGlobals.topLevelApplication.pageName.text = "";
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
		}
		
		/**
		 * Sets the disconnect status based on disconnectionStatusCode recieved from DisconnectUserCommand
		 */
		public function changeConnectionStatus(disconnectionStatusCode:int):void {
			switch (disconnectionStatusCode) {
				case DisconnectEnum.CONNECTION_STATUS_MEETING_ENDED:
					view.currentState = DisconnectType.CONNECTION_STATUS_MEETING_ENDED_STRING;
					break;
				case DisconnectEnum.CONNECTION_STATUS_CONNECTION_DROPPED:
					view.currentState = DisconnectType.CONNECTION_STATUS_CONNECTION_DROPPED_STRING;
					break;
				case DisconnectEnum.CONNECTION_STATUS_USER_KICKED_OUT:
					view.currentState = DisconnectType.CONNECTION_STATUS_USER_KICKED_OUT_STRING;
					break;
				case DisconnectEnum.CONNECTION_STATUS_USER_LOGGED_OUT:
					view.currentState = DisconnectType.CONNECTION_STATUS_USER_LOGGED_OUT_STRING;
					break;
			}
		}
		
		private function applicationExit(event:Event):void {
			trace("DisconnectPageViewMediator.applicationExit - exitting the application!");
			NativeApplication.nativeApplication.exit();
		}
	}
}
