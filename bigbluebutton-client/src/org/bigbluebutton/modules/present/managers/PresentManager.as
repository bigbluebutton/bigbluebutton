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
package org.bigbluebutton.modules.present.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.managers.PopUpManager;
	import mx.effects.Move;
	
	import flash.system.Capabilities;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.Conference;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.main.events.FullScreenPresentationEvent;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.ui.views.FileUploadWindow;
	import org.bigbluebutton.modules.present.ui.views.PresentationWindow;
	
	public class PresentManager
	{
		private var globalDispatcher:Dispatcher;
		private var uploadWindow:FileUploadWindow;
		private var presentWindow:PresentationWindow;
		
		private var presentWindowWidth:Number;
		private var presentWindowHeight:Number;
		private var presentWindowX:Number;
		private var presentWindowY:Number;
		private var presentWindowHeaderHeight:Number;
		
		private var showControlsY:Number;
		private var origControlsY:Number;
		private var hide:Boolean = false;
		private var hideControls:Move;
		private var unhideControls:Move;
		
		// Start to hide control bar after mouse is still for 3 seconds
		private var mouseTimer:Timer = new Timer(3000,1);
		
		//format: presentationNames = [{label:"00"}, {label:"11"}, {label:"22"} ];
		[Bindable] public var presentationNames:Array = new Array();
		
		public function PresentManager() {
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent(e:PresentModuleEvent):void{
			if (presentWindow != null) return;
			presentWindow = new PresentationWindow();
			presentWindow.visible = (e.data.showPresentWindow == "true");
			presentWindow.showControls = (e.data.showWindowControls == "true");
			openWindow(presentWindow);
		}
		
		public function handleStopModuleEvent():void{
			presentWindow.close();
		}
		
		public function handleFullScreenPresentationEvent(e:FullScreenPresentationEvent):void {
			LogUtil.debug("PresentationManager:FullScreenPresentationEvent");
			
			// Save the normal window sizes and layouts
			presentWindowWidth = presentWindow.width;
			presentWindowHeight = presentWindow.height;
			presentWindowX = presentWindow.x;
			presentWindowY = presentWindow.y;
			presentWindowHeaderHeight = presentWindow.getStyle("headerHeight");
			showControlsY = Capabilities.screenResolutionY - presentWindow.presCtrlBar.height;
			hideControls = new Move(presentWindow.presCtrlBar);
			unhideControls = new Move(presentWindow.presCtrlBar);
			
			// Make the presentation window full screen and in front
			presentWindow.width = Capabilities.screenResolutionX;
			presentWindow.height = Capabilities.screenResolutionY;
			origControlsY = Capabilities.screenResolutionY;
			presentWindow.x = 0;
			presentWindow.y = 0;
			presentWindow.setStyle("headerHeight",0);
			presentWindow.windowManager.bringToFront(presentWindow);
			
			presentWindow.isFullScreen = true;
			
			// Move the thumbnails up away from the controls
			presentWindow.slideView.fullScreenThumbnailOffset = 100;
			
			// Hide the controls by making the window larger than the screen so they hang off
			presentWindow.height = presentWindow.height + presentWindow.presCtrlBar.height;
			hide = true;
			
			if (UserManager.getInstance().getConference().amIPresenter()) {
				// for the presenter, let mouse movement unhide the controls, lack of movement hide them
				presentWindow.addEventListener(MouseEvent.MOUSE_MOVE, mouseHandler);
				presentWindow.addEventListener(MouseEvent.CLICK, mouseHandler);
				mouseTimer.addEventListener(TimerEvent.TIMER_COMPLETE, mouseStillHandler);
				mouseTimer.reset();
				mouseTimer.start();
			}
		}
		
		public function handleWindowPresentationEvent(e:FullScreenPresentationEvent):void {
			LogUtil.debug("PresentationManager:WindowPresentationEvent");
			mouseTimer.stop();
			unhideControls.stop();
			hideControls.stop();
			presentWindow.removeEventListener(MouseEvent.MOUSE_MOVE, mouseHandler);
			presentWindow.removeEventListener(MouseEvent.CLICK, mouseHandler);
			mouseTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, mouseStillHandler);
			presentWindow.autoLayout = true;
			presentWindow.width = presentWindowWidth;
			presentWindow.height = presentWindowHeight;
			presentWindow.x = presentWindowX;
			presentWindow.y = presentWindowY;
			presentWindow.setStyle("headerHeight",presentWindowHeaderHeight);
			presentWindow.isFullScreen = false;
			presentWindow.slideView.fullScreenThumbnailOffset = 0;
		}
		
		private function mouseHandler(e:MouseEvent):void {
			// Mouse moved or clicked, unhide contrls: turn off autoLayout and slide the controls up their height
			hideControls.stop();
			presentWindow.autoLayout = false;
			unhideControls.yFrom = presentWindow.presCtrlBar.y;
			unhideControls.yTo = showControlsY;
			unhideControls.yBy = 1;
			unhideControls.duration = 500;
			unhideControls.play();
			//presentWindow.presCtrlBar.y = showControlsY;
			hide = false;
			mouseTimer.reset();
			mouseTimer.start();
		}
		
		private function mouseStillHandler(e:TimerEvent):void {
			if (!hide) {
				// Mouse still for duration, rehide controls: turn on autoLayout to let them drop back below the screen
				hideControls.yFrom = presentWindow.presCtrlBar.y;
				hideControls.yTo = origControlsY;
				hideControls.yBy = 1;
				hideControls.duration = 2000;
				hideControls.play();
				presentWindow.autoLayout = true;
			}
			hide = true;
			mouseTimer.start();
		}
		
		private function openWindow(window:IBbbModuleWindow):void{				
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);		
		}
	
		public function handleOpenUploadWindow(e:UploadEvent):void{
			if (uploadWindow != null) return;
			
			uploadWindow = new FileUploadWindow();
			uploadWindow.presentationNames = presentationNames;
			mx.managers.PopUpManager.addPopUp(uploadWindow, presentWindow, false);
		}
		
		public function handleCloseUploadWindow():void{
			PopUpManager.removePopUp(uploadWindow);
			uploadWindow = null;
		}
		
		public function updatePresentationNames(e:UploadEvent):void{
			LogUtil.debug("Adding presentation " + e.presentationName);
			for (var i:int = 0; i < presentationNames.length; i++) {
				if (presentationNames[i] == e.presentationName) return;
			}
			presentationNames.push(String(e.presentationName));
		}

		public function removePresentation(e:RemovePresentationEvent):void {
			LogUtil.debug("Removing presentation " + e.presentationName);
			var index:int = presentationNames.indexOf(e.presentationName as String);
			LogUtil.debug("Presentation " + e.presentationName + " at index " + index);
			
			if (index > -1) {
				presentationNames.splice(index, 1);
				LogUtil.debug("Removing presentation " + e.presentationName + " at index " + index);
			}
		}
	}
}