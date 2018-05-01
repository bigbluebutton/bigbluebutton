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
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.screenshare.services.WebRTCDeskshareService;
	import org.bigbluebutton.modules.screenshare.view.components.ScreenshareViewWindow;
	import org.bigbluebutton.modules.screenshare.view.components.WebRTCDesktopPublishWindow;
	import org.bigbluebutton.modules.screenshare.view.components.WebRTCDesktopViewWindow;

	public class WebRTCViewerWindowManager {
		private static const LOGGER:ILogger = getClassLogger(ViewerWindowManager);

		private var viewWindow:WebRTCDesktopViewWindow;
		private var service:WebRTCDeskshareService;
		private var isViewing:Boolean = false;
		private var globalDispatcher:Dispatcher;

		public function WebRTCViewerWindowManager(service:WebRTCDeskshareService) {
			this.service = service;
			globalDispatcher = new Dispatcher();
		}

		public function stopViewing():void {
			if (isViewing) viewWindow.stopViewing();
		}

		private function openWindow(window:IBbbModuleWindow):void{
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}

		public function handleViewWindowCloseEvent():void {
			LOGGER.debug("ViewerWindowManager Received stop viewing command");
			closeWindow(viewWindow);
			isViewing = false;
		}

		private function closeWindow(window:IBbbModuleWindow):void {
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}

		public function startViewing(rtmp:String, videoWidth:Number, videoHeight:Number):void{
			LOGGER.debug("ViewerWindowManager::startViewing");

			viewWindow = new WebRTCDesktopViewWindow();
			viewWindow.startVideo(rtmp, videoWidth, videoHeight);
			openWindow(viewWindow);
			isViewing = true;
		}
	}
}
