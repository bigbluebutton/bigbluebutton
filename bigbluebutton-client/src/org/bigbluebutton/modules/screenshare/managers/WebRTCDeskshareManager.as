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
package org.bigbluebutton.modules.screenshare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.external.ExternalInterface;
	
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.api.JSLog;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.phone.models.WebRTCAudioStatus;
	import org.bigbluebutton.modules.screenshare.events.DeskshareToolbarEvent;
	import org.bigbluebutton.modules.screenshare.events.IsSharingScreenEvent;
	import org.bigbluebutton.modules.screenshare.events.ShareStartedEvent;
	import org.bigbluebutton.modules.screenshare.events.UseJavaModeCommand;
	import org.bigbluebutton.modules.screenshare.events.WebRTCPublishWindowChangeState;
	import org.bigbluebutton.modules.screenshare.events.WebRTCViewStreamEvent;
	import org.bigbluebutton.modules.screenshare.model.ScreenshareOptions;
	import org.bigbluebutton.modules.screenshare.services.WebRTCDeskshareService;
	import org.bigbluebutton.modules.screenshare.utils.WebRTCScreenshareUtility;

	public class WebRTCDeskshareManager {
		private static const LOGGER:ILogger = getClassLogger(WebRTCDeskshareManager);

		private var publishWindowManager:WebRTCPublishWindowManager;
		private var viewWindowManager:WebRTCViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:ScreenshareModule;
		private var service:WebRTCDeskshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;
		private var usingWebRTC:Boolean = false;
		private var usingKurentoWebRTC:Boolean = false;
		private var chromeExtensionKey:String = null;
		private var options:ScreenshareOptions;
		private var videoLoadingCallbackName:String = "videoLoadingCallback";

		public function WebRTCDeskshareManager() {
			LOGGER.debug("WebRTCDeskshareManager::WebRTCDeskshareManager");
			service = new WebRTCDeskshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new WebRTCPublishWindowManager(service);
			viewWindowManager = new WebRTCViewerWindowManager(service);
			options = Options.getOptions(ScreenshareOptions) as ScreenshareOptions;
		}

		public function handleStartModuleEvent(module:ScreenshareModule):void {
			LOGGER.debug("WebRTC Screenshare Module starting");
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
			LOGGER.debug("WebRTCDeskshareManager::handleStreamStoppedEvent Sending deskshare stopped command");
			stopWebRTCDeskshare();
		}

		/*viewer being told there is no more stream*/
		public function handleStreamStopEvent(args:Object):void {
			LOGGER.debug("WebRTCDeskshareManager::handleStreamStopEvent");
			sharing = false;
			viewWindowManager.handleViewWindowCloseEvent();
		}

		public function handleRequestStopSharingEvent():void {
			/* stopping WebRTC deskshare. Alert DeskshareManager to reset toolbar */
			globalDispatcher.dispatchEvent(new DeskshareToolbarEvent(DeskshareToolbarEvent.STOP));
			stopWebRTCDeskshare();
		}

		private function stopWebRTCDeskshare():void {
			LOGGER.debug("WebRTCDeskshareManager::stopWebRTCDeskshare");
			viewWindowManager.stopViewing();

			/* close the sharing window. The sharing window can also be open when going through
			extension installation */
			publishWindowManager.stopSharing();

			if (ExternalInterface.available && usingKurentoWebRTC) {
				ExternalInterface.call("kurentoExitScreenShare");
			}
		}

		private function startWebRTCDeskshare():void {
			LOGGER.debug("WebRTCDeskshareManager::startWebRTCDeskshare");

			if (ExternalInterface.available && usingKurentoWebRTC) {
				var videoTag:String = "localWebRTCVideo";
				var onFail:Function = function(args:Object):void {
					LOGGER.debug("WebRTCDeskshareManager::startWebRTCDeskshare - falling back to java");
					globalDispatcher.dispatchEvent(new UseJavaModeCommand())
				};
				ExternalInterface.addCallback("onFail", onFail);

				var voiceBridge:String = UsersUtil.getVoiceBridge();
				var myName:String = UsersUtil.getMyUsername();
				var internalMeetingID:String = UsersUtil.getInternalMeetingID();

				ExternalInterface.call(
						'kurentoShareScreen',
						videoTag,
						voiceBridge,
						myName,
						internalMeetingID,
						"onFail",
						chromeExtensionKey);
				
			}
		}

		private function initDeskshare():void {
			LOGGER.debug("WebRTCDeskshareManager::initDeskshare");
			sharing = false;

			if (!StringUtils.isEmpty(options.chromeExtensionKey)) {
				chromeExtensionKey = options.chromeExtensionKey;
			}
			usingKurentoWebRTC = options.tryKurentoWebRTC;
		}

		public function handleMadePresenterEvent(e:MadePresenterEvent):void {
			LOGGER.debug("Got MadePresenterEvent ");
			initDeskshare();
		}

		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			LOGGER.debug("Got MadeViewerEvent ");
			if (sharing) {
				publishWindowManager.stopSharing();
				stopWebRTCDeskshare();
			}
			sharing = false;
		}

		/* When WebRTC DS cannot be used. Marks usingWebRTC as false,
			 sends out fall back to java command
		*/
		private function cannotUseWebRTC (message:String):void {
			LOGGER.debug("Cannot use WebRTC Screensharing: " + message);
			JSLog.warn("Cannot use WebRTC Screensharing: ", message);
			usingWebRTC = false;
			usingKurentoWebRTC = false;
			// send out event to fallback to Java
			globalDispatcher.dispatchEvent(new UseJavaModeCommand());
		};

		/* When WebRTC is supported in the browser, theres an extension key,
			 but not configured properly (no extension for example)
		*/
		private function webRTCWorksButNotConfigured (message:String):void {
			LOGGER.debug("WebRTC Screenshare needs to be configured clientside: " + message);
			JSLog.warn("WebRTC Screenshare needs to be configured clientside: ", message);
			publishWindowManager.openWindow();
			globalDispatcher.dispatchEvent(new WebRTCPublishWindowChangeState(WebRTCPublishWindowChangeState.DISPLAY_INSTALL));
		}

		/* WebRTC is supported and everything is configured properly (extension exists),
			 attempt to share
		*/
		private function webRTCWorksAndConfigured (message:String):void {
			LOGGER.debug("WebRTC Screenshare works, start sharing: " + message);
			JSLog.warn("WebRTC Screenshare works, start sharing: ", message);
			usingWebRTC = true;
			startWebRTCDeskshare();
		}

		/*handle start sharing event*/
		public function handleStartSharingEvent():void {
			LOGGER.debug("WebRTCDeskshareManager::handleStartSharingEvent");

			if (WebRTCAudioStatus.getInstance().getDidWebRTCAudioFail()) {
				usingWebRTC = false;
				usingKurentoWebRTC = false;
				globalDispatcher.dispatchEvent(new UseJavaModeCommand());
				return;
			}

			WebRTCScreenshareUtility.canIUseWebRTCOnThisBrowser(cannotUseWebRTC, webRTCWorksButNotConfigured, webRTCWorksAndConfigured);
		}

		public function handleShareWindowCloseEvent():void {
			publishWindowManager.handleShareWindowCloseEvent();
			sharing = false;
			stopWebRTCDeskshare();
		}

		public function handleViewWindowCloseEvent():void {
			LOGGER.debug("Received stop viewing command");
			sharing = false;
			viewWindowManager.handleViewWindowCloseEvent();
		}

		public function handleStreamStartEvent(e:WebRTCViewStreamEvent):void{
			if (sharing) return; //TODO must uncomment this for the non-webrtc desktop share
			var isPresenter:Boolean = UsersUtil.amIPresenter();
			LOGGER.debug("Received start viewing command when isPresenter==[{0}]",[isPresenter]);

			if(isPresenter && usingWebRTC) {
				publishWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
				globalDispatcher.dispatchEvent(new DeskshareToolbarEvent(DeskshareToolbarEvent.START));
			} else {

				if (!options.tryWebRTCFirst || e == null || e.rtmp == null) {
					return;
				}

				viewWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
			}

			 sharing = true; //TODO must uncomment this for the non-webrtc desktop share
		}

		public function handleUseJavaModeCommand():void {
			LOGGER.debug("WebRTCDeskshareManager::handleUseJavaModeCommand");
			usingWebRTC = false;
			usingKurentoWebRTC = false;
		}

		public function handleRequestStartSharingEvent():void {
			LOGGER.debug("WebRTCDeskshareManager::handleRequestStartSharingEvent");
			initDeskshare();
			handleStartSharingEvent();
		}

		public function handleScreenShareStartedEvent(event:ShareStartedEvent):void {
			if (UsersUtil.amIPresenter()) {
			} else {
				/*handleStreamStartEvent(ScreenshareModel.getInstance().streamId, event.width, event.height);*/
				handleStreamStartEvent(null);
			}

			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new WebRTCViewStreamEvent(WebRTCViewStreamEvent.START));
		}

		public function handleIsSharingScreenEvent(event: IsSharingScreenEvent):void {
			if (UsersUtil.amIPresenter()) {
			} else {
				/*handleStreamStartEvent(ScreenshareModel.getInstance().streamId, event.width, event.height);*/
				handleStreamStartEvent(null);
			}

			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new WebRTCViewStreamEvent(WebRTCViewStreamEvent.START));
		}
	}
}
