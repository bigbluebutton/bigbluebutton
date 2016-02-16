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

package org.bigbluebutton.modules.deskshare.managers
{
	import com.asfusion.mate.events.Dispatcher;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.deskshare.events.UseJavaModeCommand;
	import org.bigbluebutton.modules.deskshare.model.DeskshareOptions;
	import org.bigbluebutton.modules.deskshare.services.DeskshareService;
	import org.bigbluebutton.modules.deskshare.utils.JavaCheck;
	import org.bigbluebutton.modules.deskshare.utils.BrowserCheck;
	import flash.external.ExternalInterface;

	public class DeskshareManager {
		private static const LOGGER:ILogger = getClassLogger(DeskshareManager);

		private var publishWindowManager:PublishWindowManager;
		private var viewWindowManager:ViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:DeskShareModule;
		private var service:DeskshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;
		private var usingJava:Boolean = false;

		public function DeskshareManager() {
			service = new DeskshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new PublishWindowManager(service);
			viewWindowManager = new ViewerWindowManager(service);
			toolbarButtonManager = new ToolbarButtonManager();
		}

		public function handleStartModuleEvent(module:DeskShareModule):void {
			LOGGER.debug("Deskshare Module starting");
			this.module = module;
			service.handleStartModuleEvent(module);

      if (UsersUtil.amIPresenter()) {
        initDeskshare();
      }

		}

		public function handleStopModuleEvent():void {
			LOGGER.debug("Deskshare Module stopping");
			publishWindowManager.stopSharing();
			viewWindowManager.stopViewing();
			service.disconnect();
		}

    public function handleStreamStoppedEvent():void {
	  LOGGER.debug("Sending deskshare stopped command");
      service.stopSharingDesktop(module.getRoom(), module.getRoom());
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
      var options:DeskshareOptions = new DeskshareOptions();
      options.parseOptions();
      if (options.autoStart) {
        handleStartSharingEvent(true);
      }
      if(options.showButton){
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
			LOGGER.debug("DeskshareManager::handleStartSharingEvent (Java)");
			var options:DeskshareOptions = new DeskshareOptions();
			options.parseOptions();

			if (options.useWebRTCIfAvailable && !BrowserCheck.isWebRTCSupported()) {
				if (BrowserCheck.isUsingLessThanChrome38OnMac()) {
					usingJava = false;
				} else {
					var javaIssue:String = JavaCheck.checkJava();

					if (javaIssue != null) {
						if (BrowserCheck.isChrome42OrHigher()) {
							usingJava = false;
						} else {
							usingJava = false;
						}
					} else {
						usingJava = true;
						toolbarButtonManager.startedSharing();

						publishWindowManager.startSharing(options.publishURI , options.useTLS , module.getRoom(), autoStart, options.autoFullScreen);
						sharing = true;
					}
				}
			} else {
				usingJava = false;
			}
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

		public function handleStreamStartEvent(videoWidth:Number, videoHeight:Number):void{
			if (sharing) return;
			LOGGER.debug("Received start viewing command");
			viewWindowManager.startViewing(module.getRoom(), videoWidth, videoHeight);
		}

		public function handleUseJavaModeCommand():void {
			usingJava = true;
			handleStartSharingEvent(true);
		}

	}
}
