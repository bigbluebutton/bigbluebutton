package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class MuteAllUsersExpectPresenterCommand extends Command {
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var mute:Boolean;
		
		override public function execute():void {
			trace("MuteAllUsersExpectPresenterCommand.execute()");
			userService.muteAllUsersExceptPresenter(mute);
		}
	}
}
