package org.bigbluebutton.web.main.commands {
	
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class AuthenticationCommandWeb extends Command {
		
		[Inject]
		public var command:String;
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function execute():void {
			switch (command) {
				case "timeOut":
					uiSession.setLoading(false, "Auth token timed out");
					//uiSession.joinFailureSignal.dispatch("authTokenTimedOut");
					break;
				case "invalid":
				default:
					uiSession.setLoading(false, "Auth token invalid");
					//uiSession.joinFailureSignal.dispatch("authTokenInvalid");
					break;
			}
		}
	}
}
