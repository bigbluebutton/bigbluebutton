package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectingFinishedCommandAIR extends Command {
		[Inject]
		public var userUISession:IUserUISession
		
		override public function execute():void {
			userUISession.loading = false;
			userUISession.pushPage(PagesENUM.PARTICIPANTS, null, TransitionAnimationENUM.APPEAR);
		}
	
	}
}
