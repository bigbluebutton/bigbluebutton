/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.modules.deskshare.utils
{
	import flash.external.ExternalInterface;
	import org.bigbluebutton.core.BBB;
	import flash.system.Capabilities;
	import org.as3commons.logging.api.getClassLogger;
	import org.as3commons.logging.api.ILogger;

	public class BrowserCheck {
		private static const LOGGER:ILogger = getClassLogger(BrowserCheck);

		public static function isChrome42OrHigher():Boolean {
			var browser:Array = ExternalInterface.call("determineBrowser");
			return ((browser[0] == "Chrome") && (parseInt(browser[1]) >= 42));
		}

		public static function isUsingLessThanChrome38OnMac():Boolean {
			var browser:Array = ExternalInterface.call("determineBrowser");
			return ((browser[0] == "Chrome") && (parseInt(browser[1]) <= 38) && (Capabilities.os.indexOf("Mac") >= 0));
		}

		public static function isWebRTCSupported():Boolean {
			LOGGER.debug("isWebRTCSupported - ExternalInterface.available=[{0}], isWebRTCAvailable=[{1}]", [ExternalInterface.available, ExternalInterface.call("isWebRTCAvailable")]);
			return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
		}

		public static function isUsingEdgePluginUnsupported():Boolean {
			var browser:Array = ExternalInterface.call("determineBrowser");
			/* Currently no browser version of Edge supports plugins */
			return browser[0] == "Edge";
		}
	}
}

