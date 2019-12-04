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
    import org.bigbluebutton.common.IBbbModuleWindow;
    import org.bigbluebutton.common.events.CloseWindowEvent;
    import org.bigbluebutton.common.events.OpenWindowEvent;
    import org.bigbluebutton.modules.screenshare.services.ScreenshareService;
    import org.bigbluebutton.modules.screenshare.view.components.ScreensharePublishWindow;
    
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
            if (shareWindow != null) shareWindow.stopSharing();
        }
        
        public function startSharing():void {
            LOGGER.debug("DS:PublishWindowManager::opening desk share window");
            if (shareWindow == null) {
              shareWindow = new ScreensharePublishWindow();
              shareWindow.initWindow(service.getConnection());
              shareWindow.visible = true;
              openWindow(shareWindow);
            }
        }
        
        public function handleShareWindowCloseEvent():void {
            closeWindow(shareWindow);
        }
        
        private function openWindow(window:IBbbModuleWindow):void {
            var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
            event.window = window;
            globalDispatcher.dispatchEvent(event);
        }
        
        private function closeWindow(window:IBbbModuleWindow):void {
            var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
            event.window = window;
            globalDispatcher.dispatchEvent(event);
            
            shareWindow = null;
        }
    }
}