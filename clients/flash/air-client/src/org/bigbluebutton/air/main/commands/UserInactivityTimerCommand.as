package org.bigbluebutton.air.main.commands
{
	import org.bigbluebutton.air.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class UserInactivityTimerCommand extends Command
	{
		[Inject]
		public var uiSession:IUISession
		
		public function UserInactivityTimerCommand()
		{
			super();
		}
		
		override public function execute():void {
			trace("RECEIVED INACTIVITY TIMER MESSAGE");
		}
	}
}