package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ChangeUserRoleCommand extends Command {
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var user:User2x;
		
		[Inject]
		public var role:String;
		
		override public function execute():void {
			userService.changeRole(user.intId, role);
		}
	}
}
