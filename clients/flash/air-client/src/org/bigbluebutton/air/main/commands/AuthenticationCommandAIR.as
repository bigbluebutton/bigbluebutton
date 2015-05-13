package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class AuthenticationCommandAIR extends Command {
		
		[Inject]
		public var command:String;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		public function AuthenticationCommandAIR() {
			super();
		}
		
		override public function execute():void {
			switch (command) {
				case "timeOut":
					userUISession.loading = false;
					userUISession.joinFailureSignal.dispatch("authTokenTimedOut");
					break;
				case "invalid":
				default:
					userUISession.loading = false;
					userUISession.joinFailureSignal.dispatch("authTokenInvalid");
					break;
			}
		}
	}
}
