package org.bigbluebutton.web.main.commands {
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectingFinishedCommandWeb extends Command {
		[Inject]
		public var uiSession:IUISession;
		
		override public function execute():void {
			uiSession.setLoading(false, "Loading Finished");
		}
	
	}
}
