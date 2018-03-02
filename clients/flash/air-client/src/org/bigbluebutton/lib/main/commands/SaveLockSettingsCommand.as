package org.bigbluebutton.lib.main.commands {
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class SaveLockSettingsCommand extends Command {
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var settings:Object;
		
		override public function execute():void {
			trace("SaveLockSettingsCommand.execute()");
			userService.saveLockSettings(settings);
		}
	}
}
