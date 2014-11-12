package org.bigbluebutton.clientcheck.command
{
	import org.bigbluebutton.clientcheck.service.IPortTunnelingService;

	import robotlegs.bender.bundles.mvcs.Command;

	public class RequestPortsCommand extends Command
	{
		[Inject]
		public var portTunnelingService:IPortTunnelingService;

		public override function execute():void
		{
			portTunnelingService.init();
		}
	}
}
