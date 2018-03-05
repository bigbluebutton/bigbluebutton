package org.bigbluebutton.air.screenshare.commands
{
	import org.bigbluebutton.air.screenshare.views.ScreenshareViewStreamMediator;
	
	import robotlegs.bender.bundles.mvcs.Command;

	public class ScreenshareStreamStoppedCommand extends Command
	{
		[Inject]
		public var viewMediator:ScreenshareViewStreamMediator;
		
		[Inject]
		public var session:String;
		
		[Inject]
		public var reason:String;
		
		public function ScreenshareStreamStoppedCommand()
		{
			super();
		}
		
		override public function execute():void {
			viewMediator.streamStopped(session, reason);
		}
	}
}