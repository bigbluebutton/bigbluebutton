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

package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.Event;
	import flash.events.MouseEvent;

	import mx.collections.ArrayCollection;
	import mx.resources.ResourceManager;
	import mx.utils.ObjectUtil;

	import org.bigbluebutton.clientcheck.command.GetConfigXMLDataSignal;
	import org.bigbluebutton.clientcheck.command.RequestBandwidthInfoSignal;
	import org.bigbluebutton.clientcheck.command.RequestBrowserInfoSignal;
	import org.bigbluebutton.clientcheck.command.RequestPortsSignal;
	import org.bigbluebutton.clientcheck.command.RequestRTMPAppsSignal;
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.IXMLConfig;
	import org.bigbluebutton.clientcheck.model.IDataProvider;
	import org.bigbluebutton.clientcheck.model.test.BrowserTest;
	import org.bigbluebutton.clientcheck.model.test.CookieEnabledTest;
	import org.bigbluebutton.clientcheck.model.test.DownloadBandwidthTest;
	import org.bigbluebutton.clientcheck.model.test.FlashVersionTest;
	import org.bigbluebutton.clientcheck.model.test.IsPepperFlashTest;
	import org.bigbluebutton.clientcheck.model.test.LanguageTest;
	import org.bigbluebutton.clientcheck.model.test.PingTest;
	import org.bigbluebutton.clientcheck.model.test.PortTest;
	import org.bigbluebutton.clientcheck.model.test.RTMPAppTest;
	import org.bigbluebutton.clientcheck.model.test.ScreenSizeTest;
	import org.bigbluebutton.clientcheck.model.test.UploadBandwidthTest;
	import org.bigbluebutton.clientcheck.model.test.UserAgentTest;
	import org.bigbluebutton.clientcheck.model.test.WebRTCEchoTest;
	import org.bigbluebutton.clientcheck.model.test.WebRTCSocketTest;
	import org.bigbluebutton.clientcheck.model.test.WebRTCSupportedTest;
	import org.bigbluebutton.clientcheck.service.IExternalApiCallbacks;

	import robotlegs.bender.bundles.mvcs.Mediator;

	public class MainViewMediator extends Mediator
	{
		[Inject]
		public var view:IMainView;

		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		[Inject]
		public var externalApiCallbacks:IExternalApiCallbacks;

		[Inject]
		public var requestBrowserInfoSignal:RequestBrowserInfoSignal;

		[Inject]
		public var requestRTMPAppsInfoSignal:RequestRTMPAppsSignal;

		[Inject]
		public var requestPortsInfoSignal:RequestPortsSignal;

		[Inject]
		public var requestBandwidthInfoSignal:RequestBandwidthInfoSignal;

		[Inject]
		public var getConfigXMLDataSignal:GetConfigXMLDataSignal;

		[Inject]
		public var config:IXMLConfig;

		[Inject]
		public var dp:IDataProvider;
		
		private static var VERSION:String=ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.version');

		override public function initialize():void
		{
			super.initialize();
			view.view.addEventListener(Event.ADDED_TO_STAGE, viewAddedToStageHandler);
		}

		protected function viewAddedToStageHandler(event:Event):void
		{
			getConfigXMLDataSignal.dispatch();
			config.configParsedSignal.add(configParsedHandler);
		}

		private function configParsedHandler():void
		{
			initPropertyListeners();
			initDataProvider();

			view.dataGrid.dataProvider=dp.getData();

			requestBrowserInfoSignal.dispatch();
			requestRTMPAppsInfoSignal.dispatch();
			requestPortsInfoSignal.dispatch();
			requestBandwidthInfoSignal.dispatch();
		}

		private function initPropertyListeners():void
		{
			systemConfiguration.userAgent.userAgentTestSuccessfullChangedSignal.add(userAgentChangedHandler);
			systemConfiguration.browser.browserTestSuccessfullChangedSignal.add(browserChangedHandler);
			systemConfiguration.screenSize.screenSizeTestSuccessfullChangedSignal.add(screenSizeChangedHandler);
			systemConfiguration.flashVersion.flashVersionTestSuccessfullChangedSignal.add(flashVersionChangedHandler);
			systemConfiguration.isPepperFlash.pepperFlashTestSuccessfullChangedSignal.add(isPepperFlashChangedHandler);
			systemConfiguration.cookieEnabled.cookieEnabledTestSuccessfullChangedSignal.add(cookieEnabledChangedHandler);
			systemConfiguration.language.languageTestSuccessfullChangedSignal.add(languageChangedHandler);
			systemConfiguration.isWebRTCSupported.webRTCSupportedTestSuccessfullChangedSignal.add(isWebRTCSupportedChangedHandler);
			systemConfiguration.webRTCEchoTest.webRTCEchoTestSuccessfullChangedSignal.add(webRTCEchoTestChangedHandler);
			systemConfiguration.webRTCSocketTest.webRTCSocketTestSuccessfullChangedSignal.add(webRTCSocketTestChangedHandler);
			systemConfiguration.downloadBandwidthTest.downloadSpeedTestSuccessfullChangedSignal.add(downloadSpeedTestChangedHandler);
			systemConfiguration.uploadBandwidthTest.uploadSpeedTestSuccessfullChangedSignal.add(uploadSpeedTestChangedHandler);
			systemConfiguration.pingTest.pingSpeedTestSuccessfullChangedSignal.add(pingSpeedTestChangedHandler);

			for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
			{
				systemConfiguration.rtmpApps[i].connectionResultSuccessfullChangedSignal.add(rtmpAppConnectionResultSuccessfullChangedHandler);
			}

			for (var j:int=0; j < systemConfiguration.ports.length; j++)
			{
				systemConfiguration.ports[j].tunnelResultSuccessfullChangedSignal.add(tunnelResultSuccessfullChangedHandler);
			}
		}

		/**
		 * Gather all Item names even before it's tested
		 */
		private function initDataProvider():void
		{
			dp.addData({Item: BrowserTest.BROWSER, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: CookieEnabledTest.COOKIE_ENABLED, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: DownloadBandwidthTest.DOWNLOAD_SPEED, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: FlashVersionTest.FLASH_VERSION, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: IsPepperFlashTest.PEPPER_FLASH, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: LanguageTest.LANGUAGE, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: PingTest.PING, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: ScreenSizeTest.SCREEN_SIZE, Result: null}, StatusENUM.LOADING);
			// The upload is not working right now
//			dp.addData({Item: UploadBandwidthTest.UPLOAD_SPEED, Result: "This is supposed to be failing right now"}, StatusENUM.FAILED);
			dp.addData({Item: UserAgentTest.USER_AGENT, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: WebRTCEchoTest.WEBRTC_ECHO_TEST, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: WebRTCSocketTest.WEBRTC_SOCKET_TEST, Result: null}, StatusENUM.LOADING);
			dp.addData({Item: WebRTCSupportedTest.WEBRTC_SUPPORTED, Result: null}, StatusENUM.LOADING);
			if (systemConfiguration.rtmpApps)
			{
				for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
				{
					dp.addData({Item: systemConfiguration.rtmpApps[i].applicationName, Result: null}, StatusENUM.LOADING);
				}
			}
			if (systemConfiguration.ports)
			{
				for (var j:int=0; j < systemConfiguration.ports.length; j++)
				{
					dp.addData({Item: systemConfiguration.ports[j].portName, Result: null}, StatusENUM.LOADING);
				}
			}
			dp.addData({Item: VERSION, Result: config.getVersion()}, StatusENUM.SUCCEED);

		}

		/**
		 * When RTMPApp item is getting updated we receive notification with 'applicationUri' of updated item
		 * We need to retrieve this item from the list of the available items and put it inside datagrid
		 **/
		private function getRTMPAppItemByURI(applicationUri:String):RTMPAppTest
		{
			for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
			{
				if (systemConfiguration.rtmpApps[i].applicationUri == applicationUri)
					return systemConfiguration.rtmpApps[i];
			}
			return null;
		}

		private function rtmpAppConnectionResultSuccessfullChangedHandler(applicationUri:String):void
		{
			var appObj:RTMPAppTest=getRTMPAppItemByURI(applicationUri);

			if (appObj)
			{
				var status:Object = (appObj.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
				dp.updateData({Item: appObj.applicationName, Result: appObj.testResult}, status);
			}
			else
			{
				trace("Coudn't find rtmp app by applicationUri, skipping item: " + applicationUri);
			}
		}

		private function getPortItemByPortName(port:String):PortTest
		{
			for (var i:int=0; i < systemConfiguration.ports.length; i++)
			{
				if (systemConfiguration.ports[i].portNumber == port)
					return systemConfiguration.ports[i];
			}
			return null;
		}

		private function tunnelResultSuccessfullChangedHandler(port:String):void
		{
			var portObj:PortTest=getPortItemByPortName(port);

			if (portObj)
			{
				var status:Object = (portObj.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
				dp.updateData({Item: portObj.portName, Result: portObj.testResult}, status);
			}
			else
			{
				trace("Coudn't find port by port name, skipping item: " + port);
			}
		}

		private function pingSpeedTestChangedHandler():void
		{
			var status:Object = (systemConfiguration.pingTest.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: PingTest.PING, Result: systemConfiguration.pingTest.testResult}, status);
		}

		private function downloadSpeedTestChangedHandler():void
		{
			var status:Object = (systemConfiguration.downloadBandwidthTest.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: DownloadBandwidthTest.DOWNLOAD_SPEED, Result: systemConfiguration.downloadBandwidthTest.testResult}, status);
		}

		private function uploadSpeedTestChangedHandler():void
		{
			var status:Object = (systemConfiguration.uploadBandwidthTest.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: UploadBandwidthTest.UPLOAD_SPEED, Result: systemConfiguration.uploadBandwidthTest.testResult}, status);
		}

		private function webRTCSocketTestChangedHandler():void
		{
			var status:Object = (systemConfiguration.webRTCSocketTest.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: WebRTCSocketTest.WEBRTC_SOCKET_TEST, Result: systemConfiguration.webRTCSocketTest.testResult}, status);
		}

		private function webRTCEchoTestChangedHandler():void
		{
			var status:Object = (systemConfiguration.webRTCEchoTest.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: WebRTCEchoTest.WEBRTC_ECHO_TEST, Result: systemConfiguration.webRTCEchoTest.testResult}, status);
		}

		private function isPepperFlashChangedHandler():void
		{
			var status:Object = (systemConfiguration.isPepperFlash.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: IsPepperFlashTest.PEPPER_FLASH, Result: systemConfiguration.isPepperFlash.testResult}, status);
		}

		private function languageChangedHandler():void
		{
			var status:Object = (systemConfiguration.language.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: LanguageTest.LANGUAGE, Result: systemConfiguration.language.testResult}, status);
		}

		private function isWebRTCSupportedChangedHandler():void
		{
			var status:Object = (systemConfiguration.isWebRTCSupported.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: WebRTCSupportedTest.WEBRTC_SUPPORTED, Result: systemConfiguration.isWebRTCSupported.testResult}, status);
		}

		private function cookieEnabledChangedHandler():void
		{
			var status:Object = (systemConfiguration.cookieEnabled.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: CookieEnabledTest.COOKIE_ENABLED, Result: systemConfiguration.cookieEnabled.testResult}, status);
		}

		private function screenSizeChangedHandler():void
		{
			var status:Object = (systemConfiguration.screenSize.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: ScreenSizeTest.SCREEN_SIZE, Result: systemConfiguration.screenSize.testResult}, status);
		}

		private function browserChangedHandler():void
		{
			var status:Object;
			if (systemConfiguration.browser.testSuccessfull == true) {
				status = StatusENUM.SUCCEED;
			} else {
				status = ObjectUtil.clone(StatusENUM.WARNING);
				status.StatusMessage = systemConfiguration.browser.testMessage;
			}
			dp.updateData({Item: BrowserTest.BROWSER, Result: systemConfiguration.browser.testResult}, status);
		}

		private function userAgentChangedHandler():void
		{
			var status:Object = (systemConfiguration.userAgent.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: UserAgentTest.USER_AGENT, Result: systemConfiguration.userAgent.testResult}, status);
		}

		private function flashVersionChangedHandler():void
		{
			var status:Object = (systemConfiguration.flashVersion.testSuccessfull == true) ? StatusENUM.SUCCEED : StatusENUM.FAILED;
			dp.updateData({Item: FlashVersionTest.FLASH_VERSION, Result: systemConfiguration.flashVersion.testResult}, status);
		}

		override public function destroy():void
		{
			if (systemConfiguration.rtmpApps)
			{
				for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
				{
					systemConfiguration.rtmpApps[i].connectionResultSuccessfullChangedSignal.remove(rtmpAppConnectionResultSuccessfullChangedHandler);
				}
			}

			if (systemConfiguration.ports)
			{
				for (var j:int=0; j < systemConfiguration.ports.length; j++)
				{
					systemConfiguration.ports[j].tunnelResultSuccessfullChangedSignal.remove(tunnelResultSuccessfullChangedHandler);
				}
			}

			systemConfiguration.screenSize.screenSizeTestSuccessfullChangedSignal.remove(screenSizeChangedHandler);
			systemConfiguration.userAgent.userAgentTestSuccessfullChangedSignal.remove(userAgentChangedHandler);
			systemConfiguration.browser.browserTestSuccessfullChangedSignal.remove(browserChangedHandler);
			systemConfiguration.flashVersion.flashVersionTestSuccessfullChangedSignal.remove(flashVersionChangedHandler);
			systemConfiguration.isPepperFlash.pepperFlashTestSuccessfullChangedSignal.remove(isPepperFlashChangedHandler);
			systemConfiguration.cookieEnabled.cookieEnabledTestSuccessfullChangedSignal.remove(cookieEnabledChangedHandler);
			systemConfiguration.webRTCEchoTest.webRTCEchoTestSuccessfullChangedSignal.remove(webRTCEchoTestChangedHandler);
			systemConfiguration.webRTCSocketTest.webRTCSocketTestSuccessfullChangedSignal.remove(webRTCSocketTestChangedHandler);
			systemConfiguration.language.languageTestSuccessfullChangedSignal.remove(languageChangedHandler);
			systemConfiguration.isWebRTCSupported.webRTCSupportedTestSuccessfullChangedSignal.remove(isWebRTCSupportedChangedHandler);
			systemConfiguration.downloadBandwidthTest.downloadSpeedTestSuccessfullChangedSignal.remove(downloadSpeedTestChangedHandler);
			systemConfiguration.uploadBandwidthTest.uploadSpeedTestSuccessfullChangedSignal.remove(uploadSpeedTestChangedHandler);
			systemConfiguration.pingTest.pingSpeedTestSuccessfullChangedSignal.remove(pingSpeedTestChangedHandler);

			super.destroy();
		}
	}
}
