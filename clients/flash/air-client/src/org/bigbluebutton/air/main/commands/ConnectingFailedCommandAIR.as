package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectingFailedCommandAIR extends Command {
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var reason:String;
		
		override public function execute():void {
			userUISession.loading = false;
			userUISession.joinFailureSignal.dispatch(reason);
		}
	}
}
