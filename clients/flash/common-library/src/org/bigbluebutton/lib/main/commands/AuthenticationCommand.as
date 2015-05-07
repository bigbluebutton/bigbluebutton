package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.main.models.IUserUISession;
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class AuthenticationCommand extends Command {
		
		[Inject]
		public var command:String;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		public function AuthenticationCommand() {
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
