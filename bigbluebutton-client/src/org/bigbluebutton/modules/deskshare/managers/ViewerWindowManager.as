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
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.deskshare.services.DeskshareService;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopViewWindow;
	import org.bigbluebutton.modules.deskshare.events.ShareEvent;

	public class ViewerWindowManager {		
		private static const LOGGER:ILogger = getClassLogger(ViewerWindowManager);

		private var viewWindow:DesktopViewWindow;
		private var service:DeskshareService;
		private var isViewing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		public function ViewerWindowManager(service:DeskshareService) {
			this.service = service;
			globalDispatcher = new Dispatcher();
		}
					
		public function stopViewing():void {
			if (isViewing) viewWindow.stopViewing();
		}
				
		public function handleStartedViewingEvent(stream:String):void{
			LOGGER.debug("ViewerWindowManager handleStartedViewingEvent");
			service.sendStartedViewingNotification(stream);
		}
						
		private function openWindow(window:DesktopViewWindow):void{
			var e:ShareEvent = new ShareEvent(ShareEvent.OPEN_DESKTOP_VIEW_TAB);
			e.viewTabContent = window;
			globalDispatcher.dispatchEvent(e);
		}
			
		public function handleViewWindowCloseEvent():void {
			LOGGER.debug("ViewerWindowManager Received stop viewing command");				
			closeWindow(viewWindow);
			isViewing = false;	
		}
		
		private function closeWindow(window:DesktopViewWindow):void {
			var e:ShareEvent = new ShareEvent(ShareEvent.CLOSE_DESKTOP_VIEW_TAB);
			globalDispatcher.dispatchEvent(e);
		}
			
		public function startViewing(room:String, videoWidth:Number, videoHeight:Number):void{
			LOGGER.debug("ViewerWindowManager::startViewing");
			viewWindow = new DesktopViewWindow();
			viewWindow.startVideo(service.getConnection(), room, videoWidth, videoHeight);
			
			openWindow(viewWindow);
			isViewing = true;
		}
	}
}