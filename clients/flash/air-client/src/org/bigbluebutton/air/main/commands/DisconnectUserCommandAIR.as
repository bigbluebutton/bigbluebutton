package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserCommand;
	
	public class DisconnectUserCommandAIR extends DisconnectUserCommand {
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function execute():void {
			userUISession.pushPage(PageEnum.DISCONNECT, disconnectionStatusCode, TransitionAnimationEnum.APPEAR);
			super.execute();
		}
	}
}
