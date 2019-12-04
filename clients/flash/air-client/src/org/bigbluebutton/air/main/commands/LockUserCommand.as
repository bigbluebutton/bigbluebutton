package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class LockUserCommand extends Command {
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var userId:String;
		
		[Inject]
		public var lock:Boolean;
		
		override public function execute():void {
			userService.setUserLock(userId, lock);
		}
	}
}
