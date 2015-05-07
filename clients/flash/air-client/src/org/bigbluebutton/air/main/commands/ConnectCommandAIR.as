package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.lib.main.commands.ConnectCommand;
	
	public class ConnectCommandAIR extends ConnectCommand {
		override protected function successUsersAdded():void {
			userUISession.pushPage(PagesENUM.PARTICIPANTS, null, TransitionAnimationENUM.APPEAR);
			super.successUsersAdded();
		}
	}
}
