/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bigbluebutton.clientcheck.model
{
	import org.bigbluebutton.clientcheck.model.test.BrowserTest;
	import org.bigbluebutton.clientcheck.model.test.CookieEnabledTest;
	import org.bigbluebutton.clientcheck.model.test.DownloadBandwidthTest;
	import org.bigbluebutton.clientcheck.model.test.FlashVersionTest;
	import org.bigbluebutton.clientcheck.model.test.IsPepperFlashTest;
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
