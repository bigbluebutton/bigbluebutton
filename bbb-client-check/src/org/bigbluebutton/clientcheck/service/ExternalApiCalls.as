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
