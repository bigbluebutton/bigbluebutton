package org.bigbluebutton.lib.voice.commands {
	
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class MicrophoneMuteCommand extends Command {
		
		[Inject]
		public var user:User2x;
		
		[Inject]
		public var userService:IUsersService;
		
		override public function execute():void {
			trace("MicrophoneMuteCommand.execute() - user.muted = ");// + user.muted);
			if (user != null) {
				/*
				if (user.muted) {
					userService.unmute(user);
				} else {
					userService.mute(user);
				}
				*/
			}
		}
	}
}
