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

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.IXMLConfig;
	import org.bigbluebutton.clientcheck.model.test.ITestable;

	import mx.resources.ResourceManager;

	public class ExternalApiCallbacks implements IExternalApiCallbacks
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		[Inject]
		public var config:IXMLConfig;

		public function ExternalApiCallbacks()
		{
			if (ExternalInterface.available)
			{
				ExternalInterface.addCallback("userAgent", userAgentCallbackHandler);
				ExternalInterface.addCallback("browser", browserCallbackHandler);
				ExternalInterface.addCallback("screenSize", screenSizeCallbackHandler);
				ExternalInterface.addCallback("isPepperFlash", isPepperFlashCallbackHandler);
				ExternalInterface.addCallback("cookieEnabled", cookieEnabledCallbackHandler);
				ExternalInterface.addCallback("language", languageCallbackHandler);
				ExternalInterface.addCallback("isWebRTCSupported", isWebRTCSupportedCallbackHandler);
				ExternalInterface.addCallback("webRTCEchoTest", webRTCEchoTestCallbackHandler);
				ExternalInterface.addCallback("webRTCSocketTest", webRTCSocketTestCallbackHandler);
			}
		}

		private function checkResult(result:String, item:ITestable):void
		{
			if ((result == null) || (result == ""))
			{
				item.testResult = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.result.undefined');
				item.testSuccessfull=false;
			}
			else
			{
				item.testResult=result;
				item.testSuccessfull=true;
			}
		}

		public function webRTCSocketTestCallbackHandler(success:Boolean, result:String):void
		{
			systemConfiguration.webRTCSocketTest.testResult=result;
			systemConfiguration.webRTCSocketTest.testSuccessfull=success;
		}

		public function webRTCEchoTestCallbackHandler(success:Boolean, result:String):void
		{
			systemConfiguration.webRTCEchoTest.testResult=result;
			systemConfiguration.webRTCEchoTest.testSuccessfull=success;
		}

		public function isPepperFlashCallbackHandler(value:String):void
		{
			checkResult(value, systemConfiguration.isPepperFlash);
		}

		public function languageCallbackHandler(value:String):void
		{
			checkResult(value, systemConfiguration.language);
		}

		public function isWebRTCSupportedCallbackHandler(value:String):void
		{
			checkResult(value, systemConfiguration.isWebRTCSupported);
		}

		public function cookieEnabledCallbackHandler(value:String):void
		{
			checkResult(value, systemConfiguration.cookieEnabled);
		}

		public function screenSizeCallbackHandler(value:String):void
		{
			checkResult(value, systemConfiguration.screenSize);
		}

		private function browserCallbackHandler(value:Object):void
		{
			systemConfiguration.browser.testResult = value.browser + " " + value.version;

			switch (value.browser) {
				case "Chrome":
					if (systemConfiguration.browser.isBrowserUpdated(value.version, config.getChromeLatestVersion())) {
						systemConfiguration.browser.testSuccessfull = true;
					} else {
						systemConfiguration.browser.testMessage = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.result.browser.browserOutOfDate');
						systemConfiguration.browser.testSuccessfull = false;
					}
					break;
				case "Firefox":
					if (systemConfiguration.browser.isBrowserUpdated(value.version, config.getFirefoxLatestVersion())) {
						systemConfiguration.browser.testSuccessfull = true;
					} else {
						systemConfiguration.browser.testMessage = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.result.browser.browserOutOfDate');
						systemConfiguration.browser.testSuccessfull = false;
					}
					break;
				default:
					systemConfiguration.browser.testMessage = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.result.browser.changeBrowser');
					systemConfiguration.browser.testSuccessfull = false;
			}
		}

		public function userAgentCallbackHandler(value:String):void
		{
			checkResult(value, systemConfiguration.userAgent);
		}
	}
}
