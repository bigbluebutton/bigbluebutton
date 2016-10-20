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

package org.bigbluebutton.modules.screenshare.utils
{
	import flash.external.ExternalInterface;
	import org.bigbluebutton.core.BBB;
	import flash.system.Capabilities;
	import org.as3commons.logging.api.getClassLogger;
	import org.as3commons.logging.api.ILogger;

	public class BrowserCheck {
		private static const LOGGER:ILogger = getClassLogger(BrowserCheck);

		public static function isWebRTCSupported():Boolean {
			/*LOGGER.debug("isWebRTCSupported - ExternalInterface.available=[{0}], isWebRTCAvailable=[{1}]", [ExternalInterface.available, ExternalInterface.call("isWebRTCAvailable")]);*/
			return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
		}

		public static function isChrome():Boolean {
			var browser:Array = ExternalInterface.call("determineBrowser");
			return browser[0] == "Chrome";
		}

		public static function isFirefox():Boolean {
			var browser:Array = ExternalInterface.call("determineBrowser");
			return browser[0] == "Firefox";
		}
	}
}
