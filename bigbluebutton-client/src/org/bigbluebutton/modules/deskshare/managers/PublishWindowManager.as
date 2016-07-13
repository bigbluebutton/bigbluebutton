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
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.deskshare.services.DeskshareService;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopPublishWindow;
	import org.bigbluebutton.modules.deskshare.events.ShareEvent;
			
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
			if (shareWindow != null) {
				shareWindow.stopSharing();
				shareWindow = null;
			}
		}
																			
		public function startSharing(uri:String , useTLS:Boolean , room:String, autoStart:Boolean, autoFullScreen:Boolean):void {
			LOGGER.debug("DS:PublishWindowManager::opening desk share window, autostart={0} autoFullScreen={1}", [autoStart, autoFullScreen]);

			shareWindow = new DesktopPublishWindow();
			shareWindow.initWindow(service.getConnection(), uri , useTLS , room, autoStart, autoFullScreen);
			shareWindow.visible = true;
			openWindow(shareWindow);
		}

		public function handleShareScreenEvent(fullScreen:Boolean):void {
			if(shareWindow != null) {
				LOGGER.debug("DS:PublishWindowManager: starting deskshare publishing. fullScreen = " + fullScreen);
				shareWindow.shareScreen(fullScreen);
			}
		}

		public function handleShareWindowCloseEvent():void {
			closeWindow(shareWindow);
		}
		
		private function openWindow(window:DesktopPublishWindow):void {
			var e:ShareEvent = new ShareEvent(ShareEvent.CREATE_DESKTOP_PUBLISH_TAB);
			e.publishTabContent = window;
			globalDispatcher.dispatchEvent(e);
		}
					
		private function closeWindow(window:DesktopPublishWindow):void {
			var e:ShareEvent = new ShareEvent(ShareEvent.CLEAN_DESKTOP_PUBLISH_TAB);
			globalDispatcher.dispatchEvent(e);
		}
	}
}