/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2016 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.util.browser {
	import flash.external.ExternalInterface;
	
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;

	public class BrowserCheck {
		private static const LOGGER:ILogger = getClassLogger(BrowserCheck);

		private static var _browserName:String;

		private static var _majorVersion:String;

		private static var _fullVersion:String;

		// The function below is called in $cinit, while the class is used for the first time.
		getBrowserInfo();

		public static function isWebRTCSupported():Boolean {
			/*LOGGER.debug("isWebRTCSupported - ExternalInterface.available=[{0}], isWebRTCAvailable=[{1}]", [ExternalInterface.available, ExternalInterface.call("isWebRTCAvailable")]);*/
			return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
		}

		public static function get browserName():String {
			return _browserName;
		}

		public static function get browserMajorVersion():String {
			return _majorVersion;
		}

		public static function get browserFullVersion():String {
			return _fullVersion;
		}

		public static function isChrome():Boolean {
			return _browserName.toLowerCase() == "chrome";
		}

		public static function isOpera():Boolean {
			return _browserName.toLowerCase() == "opera";
		}

		public static function isFirefox():Boolean {
			return _browserName.toLowerCase() == "firefox";
		}

		public static function isPuffinBelow46():Boolean {
			return _browserName.toLowerCase() == "puffin" && String(_fullVersion).substr(0, 3) < "4.6";
		}

		public static function isPuffin46AndAbove():Boolean {
			return browserName.toLowerCase() == "puffin" && String(_fullVersion).substr(0, 3) >= "4.6";
		}
		
		public static function isWin64():Boolean {
			var platform:String = ExternalInterface.call("window.navigator.platform.toString");
			return StringUtils.equals(platform, "Win64");
		}

		private static function getBrowserInfo():void {
			if (ExternalInterface.available && StringUtils.isEmpty(browserName)) {
				var browserInfo:Array = ExternalInterface.call("determineBrowser");
				_browserName = browserInfo[0];
				_majorVersion = String(browserInfo[1]);
				_fullVersion = String(browserInfo[2]);
			} else {
				_browserName = "unknown";
				_majorVersion = "0";
				_fullVersion = "0";
			}
		}

		public static function isHttps():Boolean {
			var httpsPattern:RegExp = /^https/;
			return httpsPattern.test(BBB.getBaseURL());
		}
	}
}
