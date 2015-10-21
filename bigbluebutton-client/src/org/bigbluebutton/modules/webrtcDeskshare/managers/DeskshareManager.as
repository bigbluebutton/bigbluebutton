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

package org.bigbluebutton.modules.webrtcDeskshare.managers
{
	import com.asfusion.mate.events.Dispatcher;

	import flash.external.ExternalInterface;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.webrtcDeskshare.events.ViewStreamEvent;
	import org.bigbluebutton.modules.webrtcDeskshare.model.DeskshareOptions;
	import org.bigbluebutton.modules.webrtcDeskshare.services.DeskshareService;

	public class DeskshareManager {
		private static const LOGGER:ILogger = getClassLogger(DeskshareManager);

		private var publishWindowManager:PublishWindowManager;
		private var viewWindowManager:ViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:WebRTCDeskShareModule;
		private var service:DeskshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;

		public function DeskshareManager() {
			service = new DeskshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new PublishWindowManager(service);
			viewWindowManager = new ViewerWindowManager(service);
			toolbarButtonManager = new ToolbarButtonManager();
		}

		public function handleStartModuleEvent(module:WebRTCDeskShareModule):void {
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

		public function handleStreamStoppedEvent():void {
			LOGGER.debug("DeskshareManager::handleStreamStoppedEvent Sending deskshare stopped command");
			service.stopSharingDesktop(module.getRoom(), module.getRoom());
			stopWebRTCDeskshare();
		}

		private function stopWebRTCDeskshare():void {
			LOGGER.debug("DeskshareManager::stopWebRTCDeskshare");
			if (ExternalInterface.available) {
				ExternalInterface.call("vertoScreenStop");
			} else {
				LOGGER.error("Error! ExternalInterface not available (webrtcDeskshare)");
			}
		}

		private function startWebRTCDeskshare():void {
			var result:String;
			if (ExternalInterface.available) {
				result = ExternalInterface.call("vertoScreenStart");
			}
		}

		public function handleStreamStartedEvent(videoWidth:Number, videoHeight:Number):void {
			LOGGER.debug("Sending startViewing command");
			service.sendStartViewingNotification(videoWidth, videoHeight);
		}

		public function handleStartedViewingEvent(stream:String):void {
			LOGGER.debug("handleStartedViewingEvent [{0}]", [stream]);
			service.sendStartedViewingNotification(stream);
		}

		private function initDeskshare():void {
			sharing = false;
			var option:DeskshareOptions = new DeskshareOptions();
			option.parseOptions();
			if (option.autoStart) {
				handleStartSharingEvent(true);
			}
			if(option.showButton){
				toolbarButtonManager.addToolbarButton();
			}
		}

		public function handleMadePresenterEvent(e:MadePresenterEvent):void {
			LOGGER.debug("Got MadePresenterEvent ");
			initDeskshare();
		}

		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			LOGGER.debug("Got MadeViewerEvent ");
			toolbarButtonManager.removeToolbarButton();
			if (sharing) {
				publishWindowManager.stopSharing();
			}
			sharing = false;
		}

		public function handleStartSharingEvent(autoStart:Boolean):void {
			LOGGER.debug("DeskshareManager::handleStartSharingEvent");
			//toolbarButtonManager.disableToolbarButton();
			toolbarButtonManager.startedSharing();
			var option:DeskshareOptions = new DeskshareOptions();
			option.parseOptions();
			startWebRTCDeskshare();
			//TODO anton use OPTIONS

			// sharing = true; //TODO must uncomment this for the non-webrtc desktop share
		}

		public function handleShareWindowCloseEvent():void {
			//toolbarButtonManager.enableToolbarButton();
			publishWindowManager.handleShareWindowCloseEvent();
			sharing = false;
			toolbarButtonManager.stopedSharing();
		}

		public function handleViewWindowCloseEvent():void {
			LOGGER.debug("Received stop viewing command");
			viewWindowManager.handleViewWindowCloseEvent();
		}

		public function handleStreamStartEvent(e:ViewStreamEvent):void{
			// if (sharing) return; //TODO must uncomment this for the non-webrtc desktop share
			var isPresenter:Boolean = UserManager.getInstance().getConference().amIPresenter;
			LOGGER.debug("Received start vieweing command when isPresenter==[{0}]",[isPresenter]);

			if(isPresenter) {
				publishWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
			} else {
				viewWindowManager.startViewing(e.rtmp, e.videoWidth, e.videoHeight);
			}

			// sharing = true; //TODO must uncomment this for the non-webrtc desktop share
		}

		// public function handleStreamStopEvent(e:ViewStreamEvent):void{
		// 	//TODO is this needed?
		// 	LogUtil.debug("Received start vieweing command");
		// 	if (!sharing) return;

		// 	handleStopModuleEvent();
		// 	sharing = false;
		// }
	}
}
