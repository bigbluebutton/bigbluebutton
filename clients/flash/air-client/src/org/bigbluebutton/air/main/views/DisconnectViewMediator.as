package org.bigbluebutton.air.main.views {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.system.Capabilities;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.main.utils.DisconnectEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class DisconnectViewMediator extends Mediator {
		
		[Inject]
		public var view:DisconnectView;
		
		[Inject]
		public var userUISession:IUISession;
		
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
		}
		
		/**
		 * Sets the disconnect status based on disconnectionStatusCode recieved from DisconnectUserCommand
		 */
		public function changeConnectionStatus(disconnectionStatusCode:int):void {
			switch (disconnectionStatusCode) {
				case DisconnectEnum.CONNECTION_STATUS_MEETING_ENDED:
					view.messageText.text = "Current meeting has been ended";
					break;
				case DisconnectEnum.CONNECTION_STATUS_CONNECTION_DROPPED:
					view.messageText.text = "Meeting connection was dropped";
					break;
				case DisconnectEnum.CONNECTION_STATUS_USER_KICKED_OUT:
					view.messageText.text = "You have been kicked out of the meeting";
					break;
				case DisconnectEnum.CONNECTION_STATUS_USER_LOGGED_OUT:
					view.messageText.text = "You have logged out of the meeting";
					break;
				case DisconnectEnum.AUTH_TOKEN_INVALID:
					view.messageText.text = "Your authorization token is invalid";
					break;
				case DisconnectEnum.AUTH_TOKEN_TIMEOUT:
					view.messageText.text = "A timeout triggered while validating your authorization token";
					break;
				case DisconnectEnum.JOIN_MEETING_TIMEOUT:
					view.messageText.text = "A timeout triggered while trying to join the meeting";
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
			// @todo : handle reconnection
		}
	}
}
