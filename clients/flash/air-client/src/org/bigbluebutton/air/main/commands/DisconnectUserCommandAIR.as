package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.lib.main.commands.DisconnectUserCommand;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class DisconnectUserCommandAIR extends DisconnectUserCommand {
		
		override public function execute():void {
			userUISession.pushPage(PagesENUM.DISCONNECT, disconnectionStatusCode, TransitionAnimationENUM.APPEAR);
			super.execute();
		}
	}
}
