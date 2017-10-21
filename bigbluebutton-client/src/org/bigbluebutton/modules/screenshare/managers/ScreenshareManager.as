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

package org.bigbluebutton.modules.screenshare.managers {
    import com.asfusion.mate.events.Dispatcher;
    
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.BBB;
    import org.bigbluebutton.core.Options;
    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.main.events.MadePresenterEvent;
    import org.bigbluebutton.modules.screenshare.events.IsSharingScreenEvent;
    import org.bigbluebutton.modules.screenshare.events.ScreenShareClientPingMessage;
    import org.bigbluebutton.modules.screenshare.events.ShareStartRequestResponseEvent;
    import org.bigbluebutton.modules.screenshare.events.ShareStartedEvent;
    import org.bigbluebutton.modules.screenshare.events.StartShareRequestFailedEvent;
    import org.bigbluebutton.modules.screenshare.events.StartShareRequestSuccessEvent;
    import org.bigbluebutton.modules.screenshare.events.ViewStreamEvent;
    import org.bigbluebutton.modules.screenshare.model.ScreenshareModel;
    import org.bigbluebutton.modules.screenshare.model.ScreenshareOptions;
    import org.bigbluebutton.modules.screenshare.services.ScreenshareService;
    import org.bigbluebutton.util.browser.BrowserCheck;

    public class ScreenshareManager {
        private static const LOGGER:ILogger = getClassLogger(ScreenshareManager);

        private var publishWindowManager:PublishWindowManager;
        private var viewWindowManager:ViewerWindowManager;
        private var toolbarButtonManager:ToolbarButtonManager;
        private var module:ScreenshareModule;
        private var service:ScreenshareService;
        private var globalDispatcher:Dispatcher;
        private var sharing:Boolean = false;
        private var usingJava:Boolean = true;
        private var options:ScreenshareOptions;

        public function ScreenshareManager() {
            options = Options.getOptions(ScreenshareOptions) as ScreenshareOptions;
            service = new ScreenshareService();
            globalDispatcher = new Dispatcher();
            publishWindowManager = new PublishWindowManager(service);
            viewWindowManager = new ViewerWindowManager(service);
            toolbarButtonManager = new ToolbarButtonManager();
        }

        public function handleStartModuleEvent(module:ScreenshareModule):void {
            LOGGER.debug("Screenshare Module starting");
            this.module = module;
            service.handleStartModuleEvent(module);

            if (UsersUtil.amIPresenter()) {
                initDeskshare();
            }
        }

        public function handleStopModuleEvent():void {
            LOGGER.debug("Screenshare Module stopping");
            publishWindowManager.stopSharing();
            viewWindowManager.stopViewing();
            service.disconnect();
        }

        public function handleConnectionSuccessEvent():void {
            LOGGER.debug("handle Connection Success Event");
            service.checkIfPresenterIsSharingScreen();
        }

        public function handleScreenShareStartedEvent(event:ShareStartedEvent):void {
            ScreenshareModel.getInstance().streamId = event.streamId;
            ScreenshareModel.getInstance().width = event.width;
            ScreenshareModel.getInstance().height = event.height;
            ScreenshareModel.getInstance().url = event.url;

            if (UsersUtil.amIPresenter()) {
                //        var dispatcher:Dispatcher = new Dispatcher();
                //        dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));
            } else {
                handleStreamStartEvent(ScreenshareModel.getInstance().streamId, event.width, event.height);
            }

            var dispatcher:Dispatcher = new Dispatcher();
            dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));
        }

        public function handleIsSharingScreenEvent(event:IsSharingScreenEvent):void {
            ScreenshareModel.getInstance().streamId = event.streamId;
            ScreenshareModel.getInstance().width = event.width;
            ScreenshareModel.getInstance().height = event.height;
            ScreenshareModel.getInstance().url = event.url;
            ScreenshareModel.getInstance().session = event.session

            if (UsersUtil.amIPresenter()) {
                //        var dispatcher:Dispatcher = new Dispatcher();
                //        dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));
            } else {
                handleStreamStartEvent(ScreenshareModel.getInstance().streamId, event.width, event.height);

            }

            var dispatcher:Dispatcher = new Dispatcher();
            dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));
        }

        private function handleStreamStartEvent(streamId:String, videoWidth:Number, videoHeight:Number):void {
            LOGGER.debug("Received start vieweing command");
            //if (!usingJava) { return; }
            viewWindowManager.startViewing(streamId, videoWidth, videoHeight);
        }

        private function initDeskshare():void {
            sharing = false;

            if (options.showButton) {
                toolbarButtonManager.addToolbarButton();
            }
        }

        public function handleMadePresenterEvent(e:MadePresenterEvent):void {
            LOGGER.debug("Got MadePresenterEvent ");
            initDeskshare();
        }

        public function handleMadeViewerEvent(e:MadePresenterEvent):void {
            LOGGER.debug("Got MadeViewerEvent ");
            toolbarButtonManager.removeToolbarButton();
            if (sharing) {
                service.requestStopSharing(ScreenshareModel.getInstance().streamId);
                publishWindowManager.stopSharing();
            }
            sharing = false;
        }

        public function handleRequestStartSharingEvent(force:Boolean = false):void {
            toolbarButtonManager.startedSharing();

            if (force || (options.tryWebRTCFirst && !BrowserCheck.isWebRTCSupported()) || !options.tryWebRTCFirst) {
              usingJava = true;
              publishWindowManager.startSharing(module.getCaptureServerUri(), module.getRoom(), BBB.initConnectionManager().isTunnelling);
              sharing = true;
              service.requestShareToken();
            } else {
              sharing = false;
              usingJava = false;
            }
        }

        public function handleShareStartEvent():void {
            service.sharingStartMessage(ScreenshareModel.getInstance().session);
        }

        public function handleScreenShareClientPingMessage(event: ScreenShareClientPingMessage):void {
            service.sendClientPongMessage(event.session, event.timestamp);
        }

        public function handleRequestPauseSharingEvent():void {
            service.requestPauseSharing(ScreenshareModel.getInstance().streamId);
        }

        public function handleRequestRestartSharingEvent():void {
            service.requestRestartSharing();
        }

        public function handleRequestStopSharingEvent():void {
            service.requestStopSharing(ScreenshareModel.getInstance().streamId);
            publishWindowManager.handleShareWindowCloseEvent();
            toolbarButtonManager.stoppedSharing();
        }

        public function handleShareStartRequestResponseEvent(event:ShareStartRequestResponseEvent):void {
            var dispatcher:Dispatcher = new Dispatcher();
            if (event.success) {
                ScreenshareModel.getInstance().authToken = event.token;
                ScreenshareModel.getInstance().jnlp = event.jnlp;
                ScreenshareModel.getInstance().streamId = event.streamId;
                ScreenshareModel.getInstance().session = event.session;

                dispatcher.dispatchEvent(new StartShareRequestSuccessEvent(ScreenshareModel.getInstance().authToken));
            } else {
                dispatcher.dispatchEvent(new StartShareRequestFailedEvent());
            }
        }

        public function handleStartSharingEvent():void {
            //toolbarButtonManager.disableToolbarButton();
            toolbarButtonManager.startedSharing();
            publishWindowManager.startSharing(module.getCaptureServerUri(), module.getRoom(), module.tunnel());
            sharing = true;
        }

        public function handleShareWindowCloseEvent():void {
            //toolbarButtonManager.enableToolbarButton();
            publishWindowManager.handleShareWindowCloseEvent();
            sharing = false;
            toolbarButtonManager.stoppedSharing();
        }

        public function handleViewWindowCloseEvent():void {
            viewWindowManager.handleViewWindowCloseEvent();
        }



        public function handleUseJavaModeCommand():void {
          // true to force Java desksharing to be used regardless of WebRTC settings
          handleRequestStartSharingEvent(true);
        }

        public function handleDeskshareToolbarStopEvent():void {
          toolbarButtonManager.stoppedSharing();
        }

        public function handleDeskshareToolbarStartEvent():void {
          toolbarButtonManager.startedSharing();
        }

    }
}
