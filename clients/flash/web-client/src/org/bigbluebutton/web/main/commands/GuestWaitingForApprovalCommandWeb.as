package org.bigbluebutton.web.main.commands {
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class GuestWaitingForApprovalCommandWeb extends Command {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function execute():void {
			trace("++ guest approved");
		}
	
	
	}
}
