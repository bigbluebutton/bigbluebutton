package org.bigbluebutton.air.main.views {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ExitViewMediator extends Mediator {
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		[Inject]
		public var view:ExitView;
		
		[Inject]
		public var userUISession:IUISession;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function initialize():void {
			view.yesButton.addEventListener(MouseEvent.CLICK, applicationExit);
			view.noButton.addEventListener(MouseEvent.CLICK, backToApplication);
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
		}
	}
}
