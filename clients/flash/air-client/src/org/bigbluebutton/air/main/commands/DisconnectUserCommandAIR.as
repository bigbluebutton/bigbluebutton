package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserCommand;
	
	public class DisconnectUserCommandAIR extends DisconnectUserCommand {
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function execute():void {
			super.execute();
			uiSession.setLoading(false);
			uiSession.pushPage(PageEnum.DISCONNECT, disconnectionStatusCode, TransitionAnimationEnum.APPEAR);
		}
	}
}
