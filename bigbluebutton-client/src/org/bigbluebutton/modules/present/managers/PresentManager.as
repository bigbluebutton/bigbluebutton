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
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.Conference;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
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