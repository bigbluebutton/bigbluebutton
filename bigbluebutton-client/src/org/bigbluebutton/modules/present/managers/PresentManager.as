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
	import mx.collections.ArrayCollection;

	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.PopUpUtil;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.events.NewPresentationPodCreated;
	import org.bigbluebutton.modules.present.events.RequestNewPresentationPodEvent;
	import org.bigbluebutton.modules.present.events.PresentationPodRemoved;
	import org.bigbluebutton.modules.present.events.RequestAllPodsEvent;
	import org.bigbluebutton.modules.present.events.GetAllPodsRespEvent;
	import org.bigbluebutton.modules.present.model.PresentOptions;
	import org.bigbluebutton.modules.present.model.PresentationPodManager;
	import org.bigbluebutton.modules.present.ui.views.FileDownloadWindow;
	import org.bigbluebutton.modules.present.ui.views.FileUploadWindow;
	import org.bigbluebutton.modules.present.ui.views.PresentationWindow;
	import org.bigbluebutton.main.api.JSLog;

	
	public class PresentManager
	{
		private var globalDispatcher:Dispatcher;
		private var windows: Array = [];
		private var podsManager: PresentationPodManager;
		
		public function PresentManager() {
			globalDispatcher = new Dispatcher();
			podsManager = PresentationPodManager.getInstance();
		}
		
		public function handleStartModuleEvent(e:PresentModuleEvent):void{
			if (windows.length >= 1) {
				return;
			}

			var event:RequestAllPodsEvent = new RequestAllPodsEvent(RequestAllPodsEvent.REQUEST_ALL_PODS);
			globalDispatcher.dispatchEvent(event);
		}

		public function handleAddPresentationPod(e: NewPresentationPodCreated): void {
			var podId: String = e.podId;
			var ownerId: String = e.ownerId;

			if(!windows.hasOwnProperty(podId)) {
				var newWindow:PresentationWindow = new PresentationWindow();
				newWindow.onPodCreated(podId, ownerId);

				var presentOptions:PresentOptions = Options.getOptions(PresentOptions) as PresentOptions;
				newWindow.visible = true; // TODO
				// newWindow.visible = presentOptions.showPresentWindow;
				newWindow.showControls = presentOptions.showWindowControls;

				windows[podId] = newWindow;

				var openEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				openEvent.window = newWindow;
				JSLog.warn("+++ PresentManager::handleAddPresentationPod openWindow req: " + podId, {});
				globalDispatcher.dispatchEvent(openEvent);

				podsManager.handleAddPresentationPod(podId, ownerId); // GOOD
			}
		}

		public function handlePresentationPodRemoved(e: PresentationPodRemoved): void {
			var podId: String = e.podId;
			var ownerId: String = e.ownerId;

			podsManager.handlePresentationPodRemoved(podId, ownerId); // GOOD

			var destroyWindow:PresentationWindow = windows[podId];
			if (destroyWindow != null) {
				var closeEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
				closeEvent.window = destroyWindow;
				globalDispatcher.dispatchEvent(closeEvent);

				delete windows[podId];
			}
		}

		public function handleGetAllPodsRespEvent(e: GetAllPodsRespEvent): void {
			var podsAC:ArrayCollection = e.pods as ArrayCollection;
			podsManager.handleGetAllPodsResp(podsAC);
		}

		public function handleStopModuleEvent():void{
			for (var key: String in windows) {
				windows[key].close();
			}
		}



		public function handleOpenUploadWindow(e:UploadEvent):void {
			var uploadWindow : FileUploadWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, FileUploadWindow, false) as FileUploadWindow;
			if (uploadWindow) {
				import org.bigbluebutton.main.api.JSLog;
				JSLog.warn("+++ PresentManager:: handleOpenUploadWindow: " + e.podId, {});
				uploadWindow.maxFileSize = e.maxFileSize;
//				uploadWindow.podId = e.podId;
				uploadWindow.setPodId(e.podId);
				
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