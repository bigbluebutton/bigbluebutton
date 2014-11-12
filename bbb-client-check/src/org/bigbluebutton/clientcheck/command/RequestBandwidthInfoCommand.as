package org.bigbluebutton.clientcheck.command
{
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.service.IDownloadBandwidthService;
	import org.bigbluebutton.clientcheck.service.IPingService;
	import org.bigbluebutton.clientcheck.service.IUploadBandwidthService;

	import robotlegs.bender.bundles.mvcs.Command;

	public class RequestBandwidthInfoCommand extends Command
	{
		[Inject]
		public var downloadBandwithService:IDownloadBandwidthService;

		[Inject]
		public var uploadBandwidthService:IUploadBandwidthService;

		[Inject]
		public var pingService:IPingService;

		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		public override function execute():void
		{
			downloadBandwithService.init();
			pingService.init();

			// commenting out upload service for now as it needs to be properly implemented
			// uploadBandwidthService.init();
		}
	}
}
