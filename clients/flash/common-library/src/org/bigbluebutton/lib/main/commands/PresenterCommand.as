package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class PresenterCommand extends Command {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var user:User;
		
		[Inject]
		public var userMeID:String;
		
		override public function execute():void {
			trace("PresenterCommand.execute() -assign presenter");
			userService.assignPresenter(user.userId, user.name, userMeID);
		}
	}
}
