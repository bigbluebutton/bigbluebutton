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
	
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.main.api.JSLog;
	import org.bigbluebutton.modules.webrtcDeskshare.services.DeskshareService;
	import org.bigbluebutton.modules.webrtcDeskshare.view.components.DesktopPublishWindow;

	public class PublishWindowManager {
		private static const LOGGER:ILogger = getClassLogger(PublishWindowManager);

		private var shareWindow:DesktopPublishWindow;
		private var globalDispatcher:Dispatcher;
		private var service:DeskshareService;
		private var buttonShownOnToolbar:Boolean = false;

		// Timer to auto-publish webcam. We need this timer to delay
		// the auto-publishing until after the Viewers's window has loaded
		// to receive the publishing events. Otherwise, the user joining next
		// won't be able to view the webcam.
		private var autoPublishTimer:Timer;

		public function PublishWindowManager(service:DeskshareService) {
			LOGGER.debug("PublishWindowManager init");
			globalDispatcher = new Dispatcher();
			this.service = service;
		}

		public function stopSharing():void {
			if (shareWindow != null) shareWindow.stopSharing();
		}

		public function startSharing(uri:String , useTLS:Boolean , room:String, autoStart:Boolean, autoFullScreen:Boolean):void {
			LOGGER.debug("DS:PublishWindowManager::opening desk share window, autostart={0} autoFullScreen={1}", [autoStart, autoFullScreen]);

			var result:String;
			if (ExternalInterface.available) {
				result = ExternalInterface.call("vertoScreenStart");
				var logData:Object = new Object();
				logData.uri = uri;
				JSLog.warn("uri:", logData);
			}


			shareWindow = new DesktopPublishWindow();
			shareWindow.visible = true;
			openWindow(shareWindow);
//			if (autoStart || autoFullScreen) {
//				/*
//				* Need to have a timer to trigger auto-publishing of deskshare.
//				*/
//				shareWindow.btnFSPublish.enabled = false;
//				shareWindow.btnRegionPublish.enabled = false;
//				autoPublishTimer = new Timer(2000, 1);
//				autoPublishTimer.addEventListener(TimerEvent.TIMER, autopublishTimerHandler);
//				autoPublishTimer.start();
//			}
		}

		private function autopublishTimerHandler(event:TimerEvent):void {
			shareWindow.shareScreen(true);
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
		}

		public function startViewing(rtmp:String, videoWidth:Number, videoHeight:Number):void{
			shareWindow.startVideo(rtmp, videoWidth, videoHeight);
		}
	}
}