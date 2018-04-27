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
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.screenshare.services.WebRTCDeskshareService;
	import org.bigbluebutton.modules.screenshare.view.components.WebRTCDesktopPublishWindow;

	public class WebRTCPublishWindowManager {
		private static const LOGGER:ILogger = getClassLogger(PublishWindowManager);

		private var shareWindow:WebRTCDesktopPublishWindow;
		private var globalDispatcher:Dispatcher;
		private var service:WebRTCDeskshareService;
		private var buttonShownOnToolbar:Boolean = false;

		// Timer to auto-publish webcam. We need this timer to delay
		// the auto-publishing until after the Viewers's window has loaded
		// to receive the publishing events. Otherwise, the user joining next
		// won't be able to view the webcam.
		private var autoPublishTimer:Timer;

		public function WebRTCPublishWindowManager(service:WebRTCDeskshareService) {
			LOGGER.debug("PublishWindowManager init");
			globalDispatcher = new Dispatcher();
			this.service = service;
		}

		public function stopSharing():void {
			if (shareWindow != null) shareWindow.stopSharing();
		}

		private function autopublishTimerHandler(event:TimerEvent):void {
			shareWindow.shareScreen(true);
		}

		public function handleShareWindowCloseEvent():void {
			closeWindow(shareWindow);
		}

		private function openWindow(window:IBbbModuleWindow = null):void {
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);

			if (window == null) {
				shareWindow = new WebRTCDesktopPublishWindow();
				shareWindow.visible = true;
				event.window = shareWindow;
			} else {
				event.window = window;
			}

			globalDispatcher.dispatchEvent(event);
		}

		private function closeWindow(window:IBbbModuleWindow):void {
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
			shareWindow = null;
		}

		public function startSharing():void {
			openWindow();
		}
		
		public function startViewing(rtmp:String, videoWidth:Number, videoHeight:Number):void{
			/* re use window object that is used to display installaion instructions */
			/* the window is first created for the instructions prompting the user to
			install the extension. this way after the extension is installed and the user
			retries when the video stream comes in it re uses the window element instead of
			making a second window and preventing the first from being removed */

			shareWindow.startVideo(rtmp, videoWidth, videoHeight);
		}
	}
}
