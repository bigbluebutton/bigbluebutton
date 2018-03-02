package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class DisconnectUserCommand extends Command {
		
		[Inject]
		public var disconnectionStatusCode:int;
		
		[Inject]
		public var userSession:IUserSession;
		
		public function DisconnectUserCommand() {
			super();
		}
		
		override public function execute():void {
			if (userSession.mainConnection)
				userSession.mainConnection.disconnect(true);
			if (userSession.videoConnection)
				userSession.videoConnection.disconnect(true);
			if (userSession.voiceConnection)
				userSession.voiceConnection.disconnect(true);
			if (userSession.screenshareConnection)
				userSession.screenshareConnection.disconnect(true);
		}
	}
}
