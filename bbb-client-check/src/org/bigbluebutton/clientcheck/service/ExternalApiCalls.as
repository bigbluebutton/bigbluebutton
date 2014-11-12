package org.bigbluebutton.clientcheck.service
{
	import flash.external.ExternalInterface;

	public class ExternalApiCalls implements IExternalApiCalls
	{
		public function requestUserAgent():void
		{
			ExternalInterface.call("BBBClientCheck.userAgent");
		}

		public function requestBrowser():void
		{
			ExternalInterface.call("BBBClientCheck.browser");
		}

		public function requestScreenSize():void
		{
			ExternalInterface.call("BBBClientCheck.screenSize");
		}

		public function requestIsPepperFlash():void
		{
			ExternalInterface.call('BBBClientCheck.isPepperFlash');
		}

		public function requestCookiesEnabled():void
		{
			ExternalInterface.call('BBBClientCheck.cookieEnabled');
		}

		public function requestJavaEnabled():void
		{
			ExternalInterface.call('BBBClientCheck.javaEnabled');
		}

		public function requestLanguage():void
		{
			ExternalInterface.call('BBBClientCheck.language');
		}

		public function requestIsWebRTCSupported():void
		{
			ExternalInterface.call('BBBClientCheck.isWebRTCSupported');
		}

		public function requestWebRTCEchoAndSocketTest():void
		{
			ExternalInterface.call('BBBClientCheck.webRTCEchoAndSocketTest');
		}
	}
}
