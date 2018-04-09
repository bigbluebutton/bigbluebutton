package org.bigbluebutton.air.main.commands
{
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class UserInactivityTimerCommand extends Command
	{
		[Inject]
		public var uiSession:IUISession
		
		[Inject]
		public var responseDuration: Number
		
		override public function execute():void {
			trace("RECEIVED INACTIVITY TIMER MESSAGE responseDuration=" + responseDuration);
			uiSession.pushPage(PageEnum.INACTIVITY_VIEW);
		}
	}
}