package org.bigbluebutton.clientcheck.service
{

	public interface IExternalApiCalls
	{
		function requestUserAgent():void;
		function requestBrowser():void;
		function requestScreenSize():void;
		function requestIsPepperFlash():void;
		function requestCookiesEnabled():void;
		function requestJavaEnabled():void;
		function requestLanguage():void;
		function requestIsWebRTCSupported():void;
		function requestWebRTCEchoAndSocketTest():void;
	}
}
