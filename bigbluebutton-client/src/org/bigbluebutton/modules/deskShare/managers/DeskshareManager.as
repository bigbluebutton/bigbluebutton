/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors: Denis Zgonjanin <me.snap@gmail.com>
 *          Richard Alam <ritzalam@gmail.com> 
 * $Id: $
 */

package org.bigbluebutton.modules.deskShare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.main.events.CloseWindowEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.main.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.deskShare.services.DeskshareService;
	import org.bigbluebutton.modules.deskShare.view.components.DesktopPublishWindow;
	import org.bigbluebutton.modules.deskShare.view.components.DesktopViewWindow;
	import org.bigbluebutton.modules.deskShare.view.components.ToolbarButton;
			
	public class DeskshareManager
	{		
		private var shareWindow:DesktopPublishWindow;
		private var viewWindow:DesktopViewWindow;
		private var button:ToolbarButton;
		private var module:DeskShareModule;
		private var service:DeskshareService;
		private var isSharing:Boolean = false;
		private var isViewing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		private var buttonShownOnToolbar:Boolean = false;
		
		public function DeskshareManager()
		{
			service = new DeskshareService();
			globalDispatcher = new Dispatcher();
			button = new ToolbarButton();
			
		}
		
		public function handleStartModuleEvent(module:DeskShareModule):void {
			LogUtil.debug("Deskshare Module starting");
			this.module = module;			
			service.connect(module.uri);
		}
		
		public function handleStopModuleEvent():void {
			LogUtil.debug("Deskshare Module stopping");
			stopSharing();
			stopViewing();
			notifyOthersToStopViewing();			
			service.disconnect();
		}
			
		private function stopSharing():void {
			if (isSharing) shareWindow.stopSharing();
		}
		
		private function stopViewing():void {
			if (isViewing) viewWindow.stopViewing();
		}
		
		public function handleStreamStartedEvent(videoWidth:Number, videoHeight:Number):void{
			LogUtil.debug("Sending startViewing command");
			isSharing = true;
			button.enabled = false;
			service.sendStartViewingNotification(videoWidth, videoHeight);
		}
		
		public function handleStreamStoppedEvent():void {
			notifyOthersToStopViewing();			
		}

		/*
		 * Notify other participants to stop viewing this participant's stream.
		 */	
		private function notifyOthersToStopViewing():void {
			LogUtil.debug("notifyOthersToStopViewing()");
			if (isSharing) {
				button.enabled = true;
				service.sendStopViewingNotification();
				isSharing = false;
			}			
		}
								
		private function addToolbarButton():void {
			LogUtil.debug("DeskShare::addToolbarButton");
			
			if ((button != null) && (!buttonShownOnToolbar)) {
				button = new ToolbarButton();
				   			   	
				var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
				event.button = button;
				globalDispatcher.dispatchEvent(event);	
				buttonShownOnToolbar = true;			
			}
		}
			
		private function removeToolbarButton():void {
			if (buttonShownOnToolbar) {
				var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.REMOVE);
				event.button = button;
				globalDispatcher.dispatchEvent(event);	
				buttonShownOnToolbar = false;			
			}
		}
		
		/* 
		 * Show the deskshare toolbar if this participant becomes the presenter.
		 */	
		public function handleMadePresenterEvent(e:MadePresenterEvent):void{
			LogUtil.debug("Got MadePresenterEvent " + e.presenter);
			if (e.presenter) {
				// stop viewing
				// add toolbar
				addToolbarButton();
			} else {
				// stop sharing
				// close window
				// remove toolbar
				removeToolbarButton();
			}
		}
		
		public function handleStartSharingEvent():void {
			LogUtil.debug("opening desk share window");
			shareWindow = new DesktopPublishWindow();
			shareWindow.xPosition = 675;
			shareWindow.yPosition = 310;
			shareWindow.initWindow(service.getConnection(), module.getCaptureServerUri(), module.getRoom());
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
			
		public function handleViewWindowCloseEvent():void {
			LogUtil.debug("Received stop viewing command");				
			closeWindow(viewWindow);
			isViewing = false;	
		}
		
		private function closeWindow(window:IBbbModuleWindow):void {
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}
			
		public function handleStreamStartEvent(videoWidth:Number, videoHeight:Number):void{
			LogUtil.debug("Received start vieweing command");
			if (isSharing) {
				LogUtil.debug("We are the one sharing, so ignore this message");
				return;
			} 
			LogUtil.debug("DeskShareEventsMap::startViewing");
			viewWindow = new DesktopViewWindow();
			viewWindow.startVideo(service.getConnection(), module.getRoom(), videoWidth, videoHeight);
			
			openWindow(viewWindow);
			isViewing = true;
		}
	}
}