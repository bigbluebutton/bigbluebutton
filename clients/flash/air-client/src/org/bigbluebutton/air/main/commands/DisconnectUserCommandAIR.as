package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserCommand;
	
	public class DisconnectUserCommandAIR extends DisconnectUserCommand {
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function execute():void {
			userUISession.pushPage(PagesENUM.DISCONNECT, disconnectionStatusCode, TransitionAnimationENUM.APPEAR);
			super.execute();
		}
	}
}
