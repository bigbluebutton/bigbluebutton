package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class RaiseHandCommand extends Command {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var userId:String;
		
		[Inject]
		public var raised:Boolean;
		
		override public function execute():void {
			if (raised) {
				trace("RaiseHandCommand.execute() - handRaised");
				userService.raiseHand();
			} else {
				trace("RaiseHandCommand.execute() - hand lowered for user " + userId + " by user " + userId);
				userService.lowerHand(userId, userSession.userId);
			}
		}
	}
}
