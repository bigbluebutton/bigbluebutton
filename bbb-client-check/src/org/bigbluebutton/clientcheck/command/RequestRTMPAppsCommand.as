package org.bigbluebutton.clientcheck.command
{
	import org.bigbluebutton.clientcheck.model.test.IPortTest;
	import org.bigbluebutton.clientcheck.model.test.IRTMPAppTest;
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.test.PortTest;
	import org.bigbluebutton.clientcheck.service.IRTMPTunnelingService;

	import robotlegs.bender.bundles.mvcs.Command;
	import org.bigbluebutton.clientcheck.model.test.RTMPAppTest;

	public class RequestRTMPAppsCommand extends Command
	{
		[Inject]
		public var rtmpTunnelingService:IRTMPTunnelingService;

		public override function execute():void
		{
			rtmpTunnelingService.init();
		}
	}
}
