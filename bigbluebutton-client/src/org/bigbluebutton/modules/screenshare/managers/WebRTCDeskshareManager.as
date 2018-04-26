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
	import com.asfusion.mate.actions.builders.serviceClasses.Request;
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
	import org.bigbluebutton.modules.screenshare.events.RequestToStartSharing;
	import org.bigbluebutton.modules.screenshare.events.ShareStartedEvent;
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

			if (ExternalInterface.available && usingWebRTC) {
				ExternalInterface.call("kurentoExitScreenShare");
			}
		}

		private function initDeskshare():void {
			LOGGER.debug("WebRTCDeskshareManager::initDeskshare");
			sharing = false;
		}

		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			LOGGER.debug("Got MadeViewerEvent ");
			if (sharing) {
				publishWindowManager.stopSharing();
				stopWebRTCDeskshare();
			}
			sharing = false;
		}

		/*handle start sharing event*/
		public function startSharing():void {
			LOGGER.debug("WebRTCDeskshareManager::handleStartSharingEvent");

			publishWindowManager.startSharing();
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

				if (!options.offerWebRTC || e == null || e.rtmp == null) {
					return;
				}

				viewWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
			}

			 sharing = true; //TODO must uncomment this for the non-webrtc desktop share
		}

		public function handleRequestStartSharingEvent(event:RequestToStartSharing):void {
			LOGGER.debug("WebRTCDeskshareManager::handleRequestStartSharingEvent");
			if (event.useWebRTC) {
				usingWebRTC = true;
				initDeskshare();
				startSharing();
			} else {
				usingWebRTC = false
			}
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
