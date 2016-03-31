/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.modules.deskshare.managers
{
	import com.asfusion.mate.events.Dispatcher;

	import flash.external.ExternalInterface;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.deskshare.events.UseJavaModeCommand;
	import org.bigbluebutton.modules.deskshare.events.WebRTCViewStreamEvent;
	import org.bigbluebutton.modules.deskshare.model.DeskshareOptions;
	import org.bigbluebutton.modules.deskshare.services.WebRTCDeskshareService;
	import org.bigbluebutton.modules.deskshare.utils.BrowserCheck;
	import org.bigbluebutton.main.api.JSLog;

	public class WebRTCDeskshareManager {
		private static const LOGGER:ILogger = getClassLogger(WebRTCDeskshareManager);

		private var publishWindowManager:WebRTCPublishWindowManager;
		private var viewWindowManager:WebRTCViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:DeskShareModule;
		private var service:WebRTCDeskshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;
		private var usingWebRTC:Boolean = false;
		private var chromeExtensionKey:String = null;

		public function WebRTCDeskshareManager() {
			service = new WebRTCDeskshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new WebRTCPublishWindowManager(service);
			viewWindowManager = new WebRTCViewerWindowManager(service);
			/*toolbarButtonManager = new ToolbarButtonManager();*/
		}

		private function getFreeswitchServerCredentials():Object {
			var credentials:Object = new Object();
			credentials.vertoPort = "PORT";
			credentials.hostName = "HOST.NAME";
			credentials.login = "LOGIN";
			credentials.password = "PASSWORD";
			return credentials;
		}

		public function handleStartModuleEvent(module:DeskShareModule):void {
			LOGGER.debug("WebRTC Deskshare Module starting");
			this.module = module;
			service.handleStartModuleEvent(module);

			if (UsersUtil.amIPresenter()) {
				initDeskshare();
			}
		}

		public function handleStopModuleEvent():void {
			LOGGER.debug("WebRTC Deskshare Module stopping");

			publishWindowManager.stopSharing();
			viewWindowManager.stopViewing();
			service.disconnect();
		}

		/*presenter stopped their program stream*/
		public function handleStreamStoppedEvent():void {
			LOGGER.debug("DeskshareManager::handleStreamStoppedEvent Sending deskshare stopped command");
			JSLog.warn("WebRTCDeskshareManager::handleStreamStoppedEvent", {});
			stopWebRTCDeskshare();
		}

		/*viewer being told there is no more stream*/
		public function handleStreamStopEvent(args:Object):void {
			LOGGER.debug("WebRTCDeskshareManager::handleStreamStopEvent");
			JSLog.warn("WebRTCDeskshareManager::handleStreamStopEvent", {});
			viewWindowManager.handleViewWindowCloseEvent();
		}

		private function stopWebRTCDeskshare():void {
			LOGGER.debug("DeskshareManager::stopWebRTCDeskshare");
			viewWindowManager.stopViewing();
			if (ExternalInterface.available) {
				var loggingCallback:Function = function(args:Object):void {LOGGER.debug(args); JSLog.warn("loggingCallback", args)};
				var onSuccess:Function = function():void { LOGGER.debug("onSuccess"); JSLog.warn("onSuccess - as", {})};
				ExternalInterface.addCallback("loggingCallback", loggingCallback);
				ExternalInterface.addCallback("onSuccess", onSuccess);
				ExternalInterface.call("endScreenshare", "loggingCallback", "onSuccess");
			} else {
				LOGGER.error("Error! ExternalInterface not available (webrtcDeskshare)");
			}
		}

		private function startWebRTCDeskshare():void {
			LOGGER.debug("DeskshareManager::startWebRTCDeskshare");

			var result:String;
			if (ExternalInterface.available) {
				var loggingCallback:Function = function(args:Object):void {LOGGER.debug(args); JSLog.warn("loggingCallback", args)};
				ExternalInterface.addCallback("loggingCallback", loggingCallback);
				var videoTag:String = "localVertoVideo";
				var modifyResolution:Boolean = false;
				// register these callbacks
				var onSuccess:Function = function():void { LOGGER.debug("onSuccess"); JSLog.warn("onSuccess - as", {})};
				ExternalInterface.addCallback("onSuccess", onSuccess);
				var onFail:Function = function(args:Object):void {
					JSLog.warn("onFail - as", args);
					JSLog.warn("WebRTCDeskshareManager::startWebRTCDeskshare - falling back to java", {});
					globalDispatcher.dispatchEvent(new UseJavaModeCommand())
				};
				ExternalInterface.addCallback("onFail", onFail);
				var vertoServerCredentials:Object = getFreeswitchServerCredentials();
				JSLog.warn("calling startScreenshare", {});
				result = ExternalInterface.call("startScreenshare", "loggingCallback", videoTag, vertoServerCredentials, chromeExtensionKey, modifyResolution, "onSuccess", "onFail");
			}
		}

		private function initDeskshare():void {
			sharing = false;
			var options:DeskshareOptions = new DeskshareOptions();
			options.parseOptions();
			if (options.chromeExtensionKey) {
				chromeExtensionKey = options.chromeExtensionKey;
			}

			if (options.autoStart) {
				handleStartSharingEvent(true);
			}
			if(options.showButton){
				/*toolbarButtonManager.addToolbarButton();*/
			}
		}

		public function handleMadePresenterEvent(e:MadePresenterEvent):void {
			LOGGER.debug("Got MadePresenterEvent ");
			initDeskshare();
		}

		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			LOGGER.debug("Got MadeViewerEvent ");
			/*toolbarButtonManager.removeToolbarButton();*/
			if (sharing) {
				publishWindowManager.stopSharing();
				stopWebRTCDeskshare();
			}
			sharing = false;
		}

		private function canIUseVertoOnThisBrowser(onFailure:Function, onSuccess:Function):void {
			LOGGER.debug("DeskshareManager::canIUseVertoOnThisBrowser");
			var options:DeskshareOptions = new DeskshareOptions();
			options.parseOptions();

			if (options.useWebRTCIfAvailable && BrowserCheck.isWebRTCSupported()) {
				JSLog.warn("WebRTCDeskshareManager::handleStartSharingEvent WebRTC Supported", {});
				if (BrowserCheck.isFirefox()) {
					onSuccess("Firefox, lets try");
				} else {
					if (chromeExtensionKey != null) {
						/*toolbarButtonManager.startedSharing();*/
						JSLog.warn("WebRTCDeskshareManager::handleStartSharingEvent chrome extension key exists - ", chromeExtensionKey);
						if (ExternalInterface.available) {
							var success:Function = function(status:String):void {
								ExternalInterface.addCallback("callback", null);
								JSLog.warn("WebRTCDeskshareManager::handleStartSharingEvent inside onSuccess", {});
								if (status == "installed-enabled") {
									JSLog.warn("Chrome Extension exists", {});
									onSuccess("worked");
								} else {
									onFailure("No Chrome Extension");
								}
							};
							ExternalInterface.addCallback("callback", success);
							ExternalInterface.call("getChromeExtensionStatus", chromeExtensionKey, "callback");
						}
					} else {
						onFailure("No chromeExtensionKey in config.xml");
						return;
					}
				}
			} else {
				onFailure("Web browser doesn't support WebRTC");
				return;
			}
		}

		/*handle start sharing event*/
		public function handleStartSharingEvent(autoStart:Boolean):void {
			LOGGER.debug("WebRTCDeskshareManager::handleStartSharingEvent");
			JSLog.warn("WebRTCDeskshareManager::handleStartSharingEvent", {});
			var onFailure:Function = function(message:String):void {
				JSLog.warn(message, {});
				usingWebRTC = false;
				// send out event to fallback to Java
				JSLog.warn("WebRTCDeskshareManager::handleStartSharingEvent - falling back to java", {});
				globalDispatcher.dispatchEvent(new UseJavaModeCommand());
				return;
			};

			var onSuccess:Function = function(message:String):void {
				JSLog.warn(message, {});
				usingWebRTC = true;
				startWebRTCDeskshare();
			};

			canIUseVertoOnThisBrowser(onFailure, onSuccess);
		}

		public function handleShareWindowCloseEvent():void {
			//toolbarButtonManager.enableToolbarButton();
			publishWindowManager.handleShareWindowCloseEvent();
			sharing = false;
			stopWebRTCDeskshare();
			/*toolbarButtonManager.stopedSharing();*/
		}

		public function handleViewWindowCloseEvent():void {
			LOGGER.debug("Received stop viewing command");
			JSLog.warn("WebRTCDeskshareManager::handleViewWindowCloseEvent", {});
			viewWindowManager.handleViewWindowCloseEvent();
		}

		public function handleStreamStartEvent(e:WebRTCViewStreamEvent):void{
			// if (!usingWebRTC) { return; } //TODO this was causing issues
			if (sharing) return; //TODO must uncomment this for the non-webrtc desktop share
			var isPresenter:Boolean = UserManager.getInstance().getConference().amIPresenter;
			LOGGER.debug("Received start viewing command when isPresenter==[{0}]",[isPresenter]);

			if(isPresenter) {
				publishWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
			} else {
				viewWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
			}

			 sharing = true; //TODO must uncomment this for the non-webrtc desktop share
		}

		public function handleUseJavaModeCommand():void {
			usingWebRTC = false;
		}
	}
}
