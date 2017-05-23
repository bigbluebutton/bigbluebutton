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
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.common.events.CloseWindowEvent;
    import org.bigbluebutton.common.events.OpenWindowEvent;
    import org.bigbluebutton.modules.screenshare.services.ScreenshareService;
    import org.bigbluebutton.modules.screenshare.view.components.ScreenshareViewWindow;
    import org.bigbluebutton.modules.screenshare.events.ShareEvent;
    
    public class ViewerWindowManager {
        private static const LOGGER:ILogger = getClassLogger(ViewerWindowManager);
        
        private var viewWindow:ScreenshareViewWindow;
        private var service:ScreenshareService;
        private var isViewing:Boolean = false;
        private var globalDispatcher:Dispatcher;
        
        public function ViewerWindowManager(service:ScreenshareService) {
            this.service = service;
            globalDispatcher = new Dispatcher();
        }
        
        public function stopViewing():void {
            if (isViewing) viewWindow.stopViewing();
        }
        
        private function openWindow(window:ScreenshareViewWindow):void {
            var e:ShareEvent = new ShareEvent(ShareEvent.OPEN_SCREENSHARE_VIEW_TAB);
            e.viewTabContent = window;
            globalDispatcher.dispatchEvent(e);
        }
        
        public function handleViewWindowCloseEvent():void {
            LOGGER.debug("ViewerWindowManager Received stop viewing command");
            closeWindow();
            isViewing = false;
        }
        
        private function closeWindow():void {
            var e:ShareEvent = new ShareEvent(ShareEvent.CLOSE_SCREENSHARE_VIEW_TAB);
            globalDispatcher.dispatchEvent(e);
        }
        
        public function startViewing(streamId:String, videoWidth:Number, videoHeight:Number):void {
            LOGGER.debug("ViewerWindowManager::startViewing");
            viewWindow = new ScreenshareViewWindow();
            viewWindow.startVideo(service.getConnection());
            openWindow(viewWindow);
            
            isViewing = true;
        }

        public function handleVideoDisplayModeEvent(actualSize:Boolean):void{
            if (isViewing) {
                viewWindow.actualSize = actualSize;
            }
        }
    }
}