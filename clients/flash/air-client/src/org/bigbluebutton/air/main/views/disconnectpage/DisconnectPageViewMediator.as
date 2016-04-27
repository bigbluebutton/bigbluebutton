package org.bigbluebutton.air.main.views.disconnectpage {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.system.Capabilities;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.main.utils.DisconnectType;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class DisconnectPageViewMediator extends Mediator {
		
		[Inject]
		public var view:IDisconnectPageView;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			// If operating system is iOS, don't show exit button because there is no way to exit application:
			if (Capabilities.version.indexOf('IOS') >= 0) {
				view.exitButton.visible = false;
			} else {
				view.exitButton.addEventListener(MouseEvent.CLICK, applicationExit);
			}
			view.reconnectButton.addEventListener(MouseEvent.CLICK, reconnect);
			changeConnectionStatus(userUISession.currentPageDetails as int);
			if (FlexGlobals.topLevelApplication.hasOwnProperty("pageName")) {
				FlexGlobals.topLevelApplication.topActionBar.pageName.text = "";
				FlexGlobals.topLevelApplication.topActionBar.visible = false;
				FlexGlobals.topLevelApplication.bottomMenu.visible = false;
			}
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
		
		override public function destroy():void {
			if (Capabilities.version.indexOf('IOS') < 0) {
				view.exitButton.removeEventListener(MouseEvent.CLICK, applicationExit);
			}
			view.reconnectButton.removeEventListener(MouseEvent.CLICK, reconnect);
		}
		
		private function applicationExit(event:Event):void {
			trace("DisconnectPageViewMediator.applicationExit - exitting the application!");
			userSession.logoutSignal.dispatch();
			NativeApplication.nativeApplication.exit();
		}
		
		private function reconnect(event:Event):void {
			trace("DisconnectPageViewMediator.reconnect - attempting to reconnect");
			userUISession.popPage();
			if (FlexGlobals.topLevelApplication.hasOwnProperty("mainshell")) {
				FlexGlobals.topLevelApplication.mainshell.visible = false;
			}
			userUISession.pushPage(PageEnum.LOGIN);
		}
	}
}
