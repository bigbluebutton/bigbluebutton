/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.deskshare.services.DeskshareService;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopPublishWindow;
			
	public class PublishWindowManager {		
		private var shareWindow:DesktopPublishWindow;
		private var isSharing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		private var service:DeskshareService;
		private var buttonShownOnToolbar:Boolean = false;
		
		public function PublishWindowManager(service:DeskshareService) {
			LogUtil.debug("PublishWindowManager init");
			globalDispatcher = new Dispatcher();
			this.service = service;
		}
					
		public function stopSharing():void {
			if (isSharing) shareWindow.stopSharing();
		}
																			
		public function startSharing(uri:String, room:String, autoStart:Boolean):void {
			LogUtil.debug("DS:PublishWindowManager::opening desk share window, autostart=" + autoStart );
			shareWindow = new DesktopPublishWindow();
			shareWindow.initWindow(service.getConnection(), uri, room, autoStart);
			shareWindow.visible = true;
			openWindow(shareWindow);
		}
		
		public function handleShareWindowCloseEvent():void {
			closeWindow(shareWindow);
		}
		
		private function openWindow(window:IBbbModuleWindow):void{				
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}
					
		private function closeWindow(window:IBbbModuleWindow):void {
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}
	}
}