package org.bigbluebutton.web.main.commands {
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectingFailedCommandWeb extends Command {
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var reason:String;
		
		override public function execute():void {
			uiSession.setLoading(true, reason);
			//uiSession.joinFailureSignal.dispatch(reason);
		}
	}
}
