package org.bigbluebutton.air.screenshare.commands
{
	import org.bigbluebutton.air.screenshare.model.IScreenshareModel;
	
	import robotlegs.bender.bundles.mvcs.Command;

	public class IsSharingScreenCommand extends Command
	{
		[Inject]
		public var model:IScreenshareModel;
		
		[Inject]
		public var streamId: String;
		
		[Inject]
		public var width: int;
		
		[Inject]
		public var height: int;
		
		[Inject]
		public var url: String;
		
		[Inject]
		public var session: String;
		
		public function IsSharingScreenCommand()
		{
			super();
		}
		
		override public function execute():void {
			model.streamId = streamId;
			model.width = width;
			model.height = height;
			model.url = url;
			model.session = session;
		}
		
	}
}