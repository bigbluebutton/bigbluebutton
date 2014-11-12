package org.bigbluebutton.clientcheck.service
{

	public interface IExternalApiCallbacks
	{
		function userAgentCallbackHandler(value:String):void;
		function cookieEnabledCallbackHandler(value:String):void;
		function isPepperFlashCallbackHandler(value:String):void;
		function languageCallbackHandler(value:String):void;
		function javaEnabledCallbackHandler(value:String):void;
		function screenSizeCallbackHandler(value:String):void;
		function isWebRTCSupportedCallbackHandler(value:String):void;
		function webRTCEchoTestCallbackHandler(success:Boolean, result:String):void;
		function webRTCSocketTestCallbackHandler(success:Boolean, result:String):void;
	}
}
