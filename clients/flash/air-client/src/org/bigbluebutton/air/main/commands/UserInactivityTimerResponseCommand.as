package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class UserInactivityTimerResponseCommand extends Command {
		
		[Inject]
		public var userService:IUsersService;
		
		public function UserInactivityTimerResponseCommand() {
			super();
		}
		
		override public function execute():void {
			userService.userInactivityAuditResponse();
		}
	}
}
