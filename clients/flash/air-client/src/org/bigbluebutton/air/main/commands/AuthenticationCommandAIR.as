package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.main.models.IUISession;
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class AuthenticationCommandAIR extends Command {
		
		[Inject]
		public var command:String;
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function execute():void {
			switch (command) {
				case "timeOut":
					uiSession.setLoading(false, "Auth token timed out");
					//userUISession.loading = false;
					//userUISession.joinFailureSignal.dispatch("authTokenTimedOut");
					break;
				case "invalid":
				default:
					uiSession.setLoading(false, "Auth token invalid");
					//userUISession.loading = false;
					//userUISession.joinFailureSignal.dispatch("authTokenInvalid");
					break;
			}
		}
	}
}
