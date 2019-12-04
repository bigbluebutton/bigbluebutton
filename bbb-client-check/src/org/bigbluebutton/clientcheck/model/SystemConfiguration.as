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

	public class SystemConfiguration implements ISystemConfiguration
	{
		private var _userAgent:UserAgentTest=new UserAgentTest;
		private var _browser:BrowserTest=new BrowserTest;
		private var _screenSize:ScreenSizeTest=new ScreenSizeTest;
		private var _flashVersion:FlashVersionTest=new FlashVersionTest;
		private var _isPepperFlash:IsPepperFlashTest=new IsPepperFlashTest;
		private var _cookieEnabled:CookieEnabledTest=new CookieEnabledTest;
		private var _language:LanguageTest=new LanguageTest;
		private var _isWebRTCSupported:WebRTCSupportedTest=new WebRTCSupportedTest;
		private var _webRTCEchoTest:WebRTCEchoTest=new WebRTCEchoTest;
		private var _webRTCSocketTest:WebRTCSocketTest=new WebRTCSocketTest;
		private var _downloadBandwidthTest:DownloadBandwidthTest=new DownloadBandwidthTest;
		private var _uploadBandwidthTest:UploadBandwidthTest=new UploadBandwidthTest;
		private var _pingTest:PingTest=new PingTest;

		private var _downloadFilePath:String;
		private var _applicationAddress:String;
		private var _serverName:String;
		private var _uploadFilePath:String;
		private var _ports:Array=new Array;
		private var _rtmpApps:Array=new Array;

		public function get userAgent():UserAgentTest
		{
			return _userAgent;
		}

		public function get browser():BrowserTest
		{
			return _browser;
		}

		public function get screenSize():ScreenSizeTest
		{
			return _screenSize;
		}

		public function get flashVersion():FlashVersionTest
		{
			return _flashVersion;
		}

		public function get isPepperFlash():IsPepperFlashTest
		{
			return _isPepperFlash;
		}

		public function get cookieEnabled():CookieEnabledTest
		{
			return _cookieEnabled;
		}

		public function get language():LanguageTest
		{
			return _language
		}

		public function get isWebRTCSupported():WebRTCSupportedTest
		{
			return _isWebRTCSupported;
		}

		public function get webRTCEchoTest():WebRTCEchoTest
		{
			return _webRTCEchoTest;
		}

		public function get webRTCSocketTest():WebRTCSocketTest
		{
			return _webRTCSocketTest;
		}

		public function get downloadBandwidthTest():DownloadBandwidthTest
		{
			return _downloadBandwidthTest;
		}

		public function get uploadBandwidthTest():UploadBandwidthTest
		{
			return _uploadBandwidthTest;
		}

		public function get pingTest():PingTest
		{
			return _pingTest;
		}

		public function get ports():Array
		{
			return _ports;
		}

		public function get rtmpApps():Array
		{
			return _rtmpApps;
		}

		public function set applicationAddress(value:String):void
		{
			_applicationAddress=value;
		}

		public function get applicationAddress():String
		{
			return _applicationAddress;
		}

		public function set serverName(value:String):void
		{
			_serverName=value;
		}

		public function get serverName():String
		{
			return _serverName;
		}

		public function set downloadFilePath(value:String):void
		{
			_downloadFilePath=value;
		}

		public function get downloadFilePath():String
		{
			return _downloadFilePath;
		}

		public function set uploadFilePath(value:String):void
		{
			_uploadFilePath=value;
		}

		public function get uploadFilePath():String
		{
			return _uploadFilePath;
		}
	}
}
