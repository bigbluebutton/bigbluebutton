package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.main.models.IUserSession;
	
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
			if (userSession.deskshareConnection)
				userSession.deskshareConnection.disconnect(true);
		}
	}
}
