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
package org.bigbluebutton.modules.present.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.display.DisplayObject;
	import flash.geom.Point;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.PopUpUtil;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.model.PresentOptions;
	import org.bigbluebutton.modules.present.ui.views.FileDownloadWindow;
	import org.bigbluebutton.modules.present.ui.views.FileUploadWindow;
	import org.bigbluebutton.modules.present.ui.views.PresentationWindow;
	
	public class PresentManager
	{
		private var globalDispatcher:Dispatcher;
		private var presentWindow:PresentationWindow;
		
		public function PresentManager() {
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent(e:PresentModuleEvent):void{
			if (presentWindow != null){ 
				return;
			}
			var presentOptions:PresentOptions = Options.getOptions(PresentOptions) as PresentOptions;
			presentWindow = new PresentationWindow();
			presentWindow.visible = presentOptions.showPresentWindow;
			presentWindow.showControls = presentOptions.showWindowControls;
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
			var uploadWindow : FileUploadWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, FileUploadWindow, false) as FileUploadWindow;
			if (uploadWindow) {
				uploadWindow.maxFileSize = e.maxFileSize;
				
				var point1:Point = new Point();
				point1.x = FlexGlobals.topLevelApplication.width / 2;
				point1.y = FlexGlobals.topLevelApplication.height / 2;  
				
				uploadWindow.x = point1.x - (uploadWindow.width/2);
				uploadWindow.y = point1.y - (uploadWindow.height/2);
			}
		}
		
		public function handleCloseUploadWindow():void{
			PopUpUtil.removePopUp(FileUploadWindow);
		}

		public function handleOpenDownloadWindow():void {
			var downloadWindow:FileDownloadWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, FileDownloadWindow, false) as FileDownloadWindow;
			if (downloadWindow) {
				var point1:Point = new Point();
				point1.x = FlexGlobals.topLevelApplication.width / 2;
				point1.y = FlexGlobals.topLevelApplication.height / 2;

				downloadWindow.x = point1.x - (downloadWindow.width/2);
				downloadWindow.y = point1.y - (downloadWindow.height/2);
			}
		}

		public function handleCloseDownloadWindow():void {
			PopUpUtil.removePopUp(FileDownloadWindow);
		}
	}
}