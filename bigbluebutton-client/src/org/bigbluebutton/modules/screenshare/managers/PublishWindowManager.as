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
    
    import flash.events.TimerEvent;
    import flash.utils.Timer;
    
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.common.IBbbModuleWindow;
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.common.events.CloseWindowEvent;
    import org.bigbluebutton.common.events.OpenWindowEvent;
    import org.bigbluebutton.modules.screenshare.services.ScreenshareService;
    import org.bigbluebutton.modules.screenshare.view.components.ScreensharePublishWindow;
    import org.bigbluebutton.modules.screenshare.events.ShareEvent;
    
    public class PublishWindowManager {
        private static const LOGGER:ILogger = getClassLogger(PublishWindowManager);
        
        private var shareWindow:ScreensharePublishWindow;
        private var globalDispatcher:Dispatcher;
        private var service:ScreenshareService;
        private var buttonShownOnToolbar:Boolean = false;
        
        public function PublishWindowManager(service:ScreenshareService) {
            LOGGER.debug("PublishWindowManager init");
            globalDispatcher = new Dispatcher();
            this.service = service;
        }
        
        public function stopSharing():void {
            if (shareWindow != null) {
                shareWindow.stopSharing();
                shareWindow = null;
            }
        }
        
        public function startSharing(uri:String, room:String):void {
            LOGGER.debug("DS:PublishWindowManager::opening desk share window");
            if (shareWindow == null) {
              shareWindow = new ScreensharePublishWindow();
              shareWindow.initWindow(service.getConnection(), uri, room);
              shareWindow.visible = true;
              openWindow(shareWindow);
            }
        }

        public function handleShareScreenEvent(fullScreen:Boolean):void {
            if (shareWindow != null) {
                LOGGER.debug("Starting deskshare publishing. fullScreen = " + fullScreen);
                shareWindow.shareScreen(fullScreen);
            }
        }
        
        public function handleShareWindowCloseEvent():void {
            closeWindow();
        }
        
        private function openWindow(window:ScreensharePublishWindow):void {
            var e:ShareEvent = new ShareEvent(ShareEvent.CREATE_SCREENSHARE_PUBLISH_TAB);
            e.publishTabContent = window;
            globalDispatcher.dispatchEvent(e);
        }
        
        private function closeWindow():void {
            var e:ShareEvent = new ShareEvent(ShareEvent.CLEAN_SCREENSHARE_PUBLISH_TAB);
            globalDispatcher.dispatchEvent(e);
        }
    }
}