package org.bigbluebutton.air.main.views.exit {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.main.utils.DisconnectType;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ExitPageViewMediator extends Mediator {
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		[Inject]
		public var view:IExitPageView;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		private var _topBarVisbile:Boolean;
		
		private var _bottomMenuVisible:Boolean;
		
		override public function initialize():void {
			view.yesButton.addEventListener(MouseEvent.CLICK, applicationExit);
			view.noButton.addEventListener(MouseEvent.CLICK, backToApplication);
			changeConnectionStatus(userUISession.currentPageDetails as int);
			FlexGlobals.topLevelApplication.topActionBar.pageName.text = "";
			_topBarVisbile = FlexGlobals.topLevelApplication.topActionBar.visible;
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			_bottomMenuVisible = FlexGlobals.topLevelApplication.bottomMenu.visible;
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
		}
		
		/**
		 * Sets the disconnect status based on disconnectionStatusCode received from DisconnectUserCommand
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
			userSession.logoutSignal.dispatch();
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_USER_LOGGED_OUT);
			NativeApplication.nativeApplication.exit();
			if (conferenceParameters.logoutUrl) {
				var urlReq:URLRequest = new URLRequest(conferenceParameters.logoutUrl);
				navigateToURL(urlReq);
			}
		}
		
		private function backToApplication(event:Event):void {
			userUISession.popPage();
		}
		
		public override function destroy():void {
			view.yesButton.removeEventListener(MouseEvent.CLICK, applicationExit);
			view.noButton.removeEventListener(MouseEvent.CLICK, backToApplication);
			FlexGlobals.topLevelApplication.topActionBar.visible = _topBarVisbile;
			FlexGlobals.topLevelApplication.bottomMenu.visible = _bottomMenuVisible;
		}
	}
}
