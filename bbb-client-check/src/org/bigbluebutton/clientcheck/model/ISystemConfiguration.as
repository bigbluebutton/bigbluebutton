package org.bigbluebutton.clientcheck.model
{
	import org.bigbluebutton.clientcheck.model.test.BrowserTest;
	import org.bigbluebutton.clientcheck.model.test.CookieEnabledTest;
	import org.bigbluebutton.clientcheck.model.test.DownloadBandwidthTest;
	import org.bigbluebutton.clientcheck.model.test.FlashVersionTest;
	import org.bigbluebutton.clientcheck.model.test.IsPepperFlashTest;
	import org.bigbluebutton.clientcheck.model.test.JavaEnabledTest;
	import org.bigbluebutton.clientcheck.model.test.LanguageTest;
	import org.bigbluebutton.clientcheck.model.test.PingTest;
	import org.bigbluebutton.clientcheck.model.test.ScreenSizeTest;
	import org.bigbluebutton.clientcheck.model.test.UploadBandwidthTest;
	import org.bigbluebutton.clientcheck.model.test.UserAgentTest;
	import org.bigbluebutton.clientcheck.model.test.WebRTCEchoTest;
	import org.bigbluebutton.clientcheck.model.test.WebRTCSocketTest;
	import org.bigbluebutton.clientcheck.model.test.WebRTCSupportedTest;

	public interface ISystemConfiguration
	{
		function get userAgent():UserAgentTest;
		function get browser():BrowserTest;
		function get screenSize():ScreenSizeTest;
		function get flashVersion():FlashVersionTest;
		function get isPepperFlash():IsPepperFlashTest;
		function get cookieEnabled():CookieEnabledTest;
		function get javaEnabled():JavaEnabledTest;
		function get language():LanguageTest;
		function get isWebRTCSupported():WebRTCSupportedTest;
		function get webRTCEchoTest():WebRTCEchoTest;
		function get webRTCSocketTest():WebRTCSocketTest;
		function get downloadBandwidthTest():DownloadBandwidthTest;
		function get uploadBandwidthTest():UploadBandwidthTest;
		function get pingTest():PingTest;
		function get ports():Array;
		function get rtmpApps():Array;
		function get applicationAddress():String;
		function set applicationAddress(value:String):void;
		function get serverName():String;
		function set serverName(value:String):void;
		function set downloadFilePath(value:String):void;
		function get downloadFilePath():String;
		function set uploadFilePath(value:String):void;
		function get uploadFilePath():String;
	}
}
