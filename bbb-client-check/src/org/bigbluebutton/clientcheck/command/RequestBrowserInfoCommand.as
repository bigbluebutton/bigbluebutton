package org.bigbluebutton.clientcheck.command
{
	import flash.external.ExternalInterface;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.service.IExternalApiCalls;
	import org.bigbluebutton.clientcheck.service.IFlashService;

	import robotlegs.bender.bundles.mvcs.Command;

	public class RequestBrowserInfoCommand extends Command
	{
		[Inject]
		public var externalApiCalls:IExternalApiCalls;

		[Inject]
		public var flashService:IFlashService;

		public override function execute():void
		{
			externalApiCalls.requestUserAgent();
			externalApiCalls.requestBrowser();
			externalApiCalls.requestScreenSize();
			externalApiCalls.requestIsPepperFlash();
			externalApiCalls.requestLanguage();
			externalApiCalls.requestCookiesEnabled();
			externalApiCalls.requestJavaEnabled();
			externalApiCalls.requestIsWebRTCSupported();
			externalApiCalls.requestWebRTCEchoAndSocketTest();

			flashService.requestFlashVersion();
		}
	}
}
