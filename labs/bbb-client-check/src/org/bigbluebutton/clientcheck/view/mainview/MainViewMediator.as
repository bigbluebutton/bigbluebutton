package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.Event;
	import flash.events.MouseEvent;

	import mx.collections.ArrayCollection;

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
	import org.bigbluebutton.clientcheck.model.test.JavaEnabledTest;
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

		private static var FAILED:String="Fail";
		private static var SUCCEED:String="Succeed";
		private static var LOADING:String="Loading...";

		private static var VERSION:String="Version";

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
			systemConfiguration.javaEnabled.javaEnabledTestSuccessfullChangedSignal.add(javaEnabledChangedHandler);
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
			dp.addData({Item: BrowserTest.BROWSER, Result: null, Status: LOADING});
			dp.addData({Item: CookieEnabledTest.COOKIE_ENABLED, Result: null, Status: LOADING});
			dp.addData({Item: DownloadBandwidthTest.DOWNLOAD_SPEED, Result: null, Status: LOADING});
			dp.addData({Item: FlashVersionTest.FLASH_VERSION, Result: null, Status: LOADING});
			dp.addData({Item: IsPepperFlashTest.PEPPER_FLASH, Result: null, Status: LOADING});
			dp.addData({Item: JavaEnabledTest.JAVA_ENABLED, Result: null, Status: LOADING});
			dp.addData({Item: LanguageTest.LANGUAGE, Result: null, Status: LOADING});
			dp.addData({Item: PingTest.PING, Result: null, Status: LOADING});
			dp.addData({Item: ScreenSizeTest.SCREEN_SIZE, Result: null, Status: LOADING});
			// The upload is not working right now
//			dp.addData({Item: UploadBandwidthTest.UPLOAD_SPEED, Result: "This is supposed to be failing right now", Status: FAILED});
			dp.addData({Item: UserAgentTest.USER_AGENT, Result: null, Status: LOADING});
			dp.addData({Item: WebRTCEchoTest.WEBRTC_ECHO_TEST, Result: null, Status: LOADING});
			dp.addData({Item: WebRTCSocketTest.WEBRTC_SOCKET_TEST, Result: null, Status: LOADING});
			dp.addData({Item: WebRTCSupportedTest.WEBRTC_SUPPORTED, Result: null, Status: LOADING});
			if (systemConfiguration.rtmpApps)
			{
				for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
				{
					dp.addData({Item: systemConfiguration.rtmpApps[i].applicationName, Result: null, Status: LOADING});
				}
			}
			if (systemConfiguration.ports)
			{
				for (var j:int=0; j < systemConfiguration.ports.length; j++)
				{
					dp.addData({Item: systemConfiguration.ports[j].portName, Result: null, Status: LOADING});
				}
			}
			dp.addData({Item: VERSION, Result: config.getVersion(), Status: SUCCEED});

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
				var obj:Object={Item: appObj.applicationName, Result: appObj.testResult, Status: ((appObj.testSuccessfull == true) ? SUCCEED : FAILED)};
				dp.updateData(obj);
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
				var obj:Object={Item: portObj.portName, Result: portObj.testResult, Status: ((portObj.testSuccessfull == true) ? SUCCEED : FAILED)};
				dp.updateData(obj);
			}
			else
			{
				trace("Coudn't find port by port name, skipping item: " + port);
			}
		}

		private function pingSpeedTestChangedHandler():void
		{
			var obj:Object={Item: PingTest.PING, Result: systemConfiguration.pingTest.testResult, Status: ((systemConfiguration.pingTest.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function downloadSpeedTestChangedHandler():void
		{
			var obj:Object={Item: DownloadBandwidthTest.DOWNLOAD_SPEED, Result: systemConfiguration.downloadBandwidthTest.testResult, Status: ((systemConfiguration.downloadBandwidthTest.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function uploadSpeedTestChangedHandler():void
		{
			var obj:Object={Item: UploadBandwidthTest.UPLOAD_SPEED, Result: systemConfiguration.uploadBandwidthTest.testResult, Status: ((systemConfiguration.uploadBandwidthTest.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function webRTCSocketTestChangedHandler():void
		{
			var obj:Object={Item: WebRTCSocketTest.WEBRTC_SOCKET_TEST, Result: systemConfiguration.webRTCSocketTest.testResult, Status: ((systemConfiguration.webRTCSocketTest.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function webRTCEchoTestChangedHandler():void
		{
			var obj:Object={Item: WebRTCEchoTest.WEBRTC_ECHO_TEST, Result: systemConfiguration.webRTCEchoTest.testResult, Status: ((systemConfiguration.webRTCEchoTest.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function isPepperFlashChangedHandler():void
		{
			var obj:Object={Item: IsPepperFlashTest.PEPPER_FLASH, Result: systemConfiguration.isPepperFlash.testResult, Status: ((systemConfiguration.isPepperFlash.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function languageChangedHandler():void
		{
			var obj:Object={Item: LanguageTest.LANGUAGE, Result: systemConfiguration.language.testResult, Status: ((systemConfiguration.language.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function javaEnabledChangedHandler():void
		{
			var obj:Object={Item: JavaEnabledTest.JAVA_ENABLED, Result: systemConfiguration.javaEnabled.testResult, Status: ((systemConfiguration.javaEnabled.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function isWebRTCSupportedChangedHandler():void
		{
			var obj:Object={Item: WebRTCSupportedTest.WEBRTC_SUPPORTED, Result: systemConfiguration.isWebRTCSupported.testResult, Status: ((systemConfiguration.isWebRTCSupported.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function cookieEnabledChangedHandler():void
		{
			var obj:Object={Item: CookieEnabledTest.COOKIE_ENABLED, Result: systemConfiguration.cookieEnabled.testResult, Status: ((systemConfiguration.cookieEnabled.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function screenSizeChangedHandler():void
		{
			var obj:Object={Item: ScreenSizeTest.SCREEN_SIZE, Result: systemConfiguration.screenSize.testResult, Status: ((systemConfiguration.screenSize.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}


		private function browserChangedHandler():void
		{
			var obj:Object={Item: BrowserTest.BROWSER, Result: systemConfiguration.browser.testResult, Status: ((systemConfiguration.browser.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function userAgentChangedHandler():void
		{
			var obj:Object={Item: UserAgentTest.USER_AGENT, Result: systemConfiguration.userAgent.testResult, Status: ((systemConfiguration.userAgent.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
		}

		private function flashVersionChangedHandler():void
		{
			var obj:Object={Item: FlashVersionTest.FLASH_VERSION, Result: systemConfiguration.flashVersion.testResult, Status: ((systemConfiguration.flashVersion.testSuccessfull == true) ? SUCCEED : FAILED)};
			dp.updateData(obj);
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
			systemConfiguration.javaEnabled.javaEnabledTestSuccessfullChangedSignal.remove(javaEnabledChangedHandler);
			systemConfiguration.isWebRTCSupported.webRTCSupportedTestSuccessfullChangedSignal.remove(isWebRTCSupportedChangedHandler);
			systemConfiguration.downloadBandwidthTest.downloadSpeedTestSuccessfullChangedSignal.remove(downloadSpeedTestChangedHandler);
			systemConfiguration.uploadBandwidthTest.uploadSpeedTestSuccessfullChangedSignal.remove(uploadSpeedTestChangedHandler);
			systemConfiguration.pingTest.pingSpeedTestSuccessfullChangedSignal.remove(pingSpeedTestChangedHandler);

			super.destroy();
		}
	}
}
