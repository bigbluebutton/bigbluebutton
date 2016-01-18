package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ChangeRoleCommand extends Command {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var roleOptions:Object;
		
		private var _userID:String;
		
		private var _role:String;
		
		override public function execute():void {
			getRoleOptions(roleOptions);
			trace("ChangeRoleCommand.execute() - change role");
			userService.changeRole(_userID, _role);
		}
		
		private function getRoleOptions(options:Object):void {
			if (options != null && options.hasOwnProperty("userID") && options.hasOwnProperty("role")) {
				_userID = options.userID;
				_role = options.role;
			}
		}
	}
}
