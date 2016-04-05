package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class GuestWaitingForApprovalCommandAIR extends Command {
		
		[Inject]
		public var userUISession:IUserUISession
		
		override public function execute():void {
			userUISession.pushPage(PageEnum.GUEST);
			userUISession.loading = false;
		}
	
	
	}
}
