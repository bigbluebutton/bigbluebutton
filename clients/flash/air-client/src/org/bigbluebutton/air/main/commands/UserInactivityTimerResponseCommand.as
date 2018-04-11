package org.bigbluebutton.air.main.commands
{
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class UserInactivityTimerResponseCommand extends Command
	{
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var uiSession:IUISession
		
		public function UserInactivityTimerResponseCommand()
		{
			super();
		}
		
		override public function execute():void {
			uiSession.popPage();
			
			userService.userInactivityAuditResponse();
		}
	}
}