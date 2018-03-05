package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class PresenterCommand extends Command {
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var user:User2x;
		
		override public function execute():void {
			trace("PresenterCommand.execute() -assign presenter");
			userService.assignPresenter(user.intId, user.name);
		}
	}
}
