package org.bigbluebutton.air.screenshare.commands
{

	import org.bigbluebutton.air.screenshare.model.IScreenshareModel;
	import org.bigbluebutton.air.screenshare.views.ScreenshareViewStreamMediator;
	
	import robotlegs.bender.bundles.mvcs.Command;

	public class ScreenshareStreamStartedCommand extends Command
	{
		[Inject]
		public var viewMediator:ScreenshareViewStreamMediator;
		
		[Inject]
		public var model:IScreenshareModel;
		
		public function ScreenshareStreamStartedCommand()
		{
			super();
		}
		
		override public function execute():void {
			viewMediator.viewStream(model.streamId, model.width, model.height);
		}
		
	}
}