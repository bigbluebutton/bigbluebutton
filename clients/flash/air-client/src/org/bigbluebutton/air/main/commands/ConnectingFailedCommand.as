package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectingFailedCommand extends Command {
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var reason:String;
		
		override public function execute():void {
			uiSession.setLoading(true, reason);
			//userUISession.loading = false;
			//userUISession.joinFailureSignal.dispatch(reason);
		}
	}
}
