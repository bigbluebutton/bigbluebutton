package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.common.views.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class GuestWaitingForApprovalCommandAIR extends Command {
		
		[Inject]
		public var userUISession:IUserUISession
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function execute():void {
			userUISession.pushPage(PagesENUM.GUEST);
			userUISession.loading = false;
		}
	
	
	}
}
