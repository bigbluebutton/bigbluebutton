package org.bigbluebutton.air.main.views.loginpage {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.InvokeEvent;
	import flash.events.MouseEvent;
	import flash.filesystem.File;
	import flash.net.URLVariables;
	import flash.system.Capabilities;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.services.ILoginService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.Application;
	
	public class LoginPageViewMediator extends Mediator {
		private const LOG:String = "LoginPageViewMediator::";
		
		[Inject]
		public var view:ILoginPageView;
		
		[Inject]
		public var joinMeetingSignal:JoinMeetingSignal;
		
		[Inject]
		public var loginService:ILoginService;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var saveData:ISaveData;
		
		private var count:Number = 0;
		
		override public function initialize():void {
			//loginService.unsuccessJoinedSignal.add(onUnsucess);
			userUISession.joinFailureSignal.add(onUnsucess);
			view.tryAgainButton.addEventListener(MouseEvent.CLICK, tryAgain);
			joinRoom(userSession.joinUrl);
		}
		
		private function onUnsucess(reason:String):void {
			trace(LOG + "onUnsucess() " + reason);
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
			switch (reason) {
				case "emptyJoinUrl":
					if (!saveData.read("rooms")) {
						view.currentState = LoginPageViewBase.STATE_NO_REDIRECT;
					}
					break;
				case "invalidMeetingIdentifier":
					view.currentState = LoginPageViewBase.STATE_INVALID_MEETING_IDENTIFIER;
					break;
				case "checksumError":
					view.currentState = LoginPageViewBase.STATE_CHECKSUM_ERROR;
					break;
				case "invalidPassword":
					view.currentState = LoginPageViewBase.STATE_INVALID_PASSWORD;
					break;
				case "invalidURL":
					view.currentState = LoginPageViewBase.STATE_INAVLID_URL;
					break;
				case "genericError":
					view.currentState = LoginPageViewBase.STATE_GENERIC_ERROR;
					break;
				case "authTokenTimedOut":
					view.currentState = LoginPageViewBase.STATE_AUTH_TOKEN_TIMEDOUT;
					break;
				case "authTokenInvalid":
					view.currentState = LoginPageViewBase.STATE_AUTH_TOKEN_INVALID;
					break;
				default:
					view.currentState = LoginPageViewBase.STATE_GENERIC_ERROR;
					break;
			}
			// view.messageText.text = reason;
		}
		
		public function joinRoom(url:String) {
			if (Capabilities.isDebugger) {
				//saveData.save("rooms", null);
				// test-install server no longer works with 0.9 mobile client
				url = "bigbluebutton://test-install.blindsidenetworks.com/bigbluebutton/api/join?fullName=AIR&meetingID=Demo+Meeting&password=mp&redirect=false&checksum=3fdf56e9915c1031c3ea012b4ec8823cedd7c272";
			}
			if (!url) {
				url = "";
			}
			if (url.lastIndexOf("://") != -1) {
				url = getEndURL(url);
			} else {
				userUISession.pushPage(PagesENUM.OPENROOM);
			}
			joinMeetingSignal.dispatch(url);
		}
		
		/**
		 * Replace the schema with "http"
		 */
		protected function getEndURL(origin:String):String {
			return origin.replace('bigbluebutton://', 'http://');
		}
		
		override public function destroy():void {
			super.destroy();
			//loginService.unsuccessJoinedSignal.remove(onUnsucess);
			userUISession.joinFailureSignal.remove(onUnsucess);
			view.dispose();
			view = null;
		}
		
		private function tryAgain(event:Event):void {
			FlexGlobals.topLevelApplication.mainshell.visible = false;
			userUISession.popPage();
			userUISession.pushPage(PagesENUM.LOGIN);
		}
	}
}
