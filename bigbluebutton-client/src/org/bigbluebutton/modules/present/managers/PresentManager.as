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
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.PopUpUtil;
	import org.bigbluebutton.main.model.users.events.RequestPresenterGroupEvent;
	import org.bigbluebutton.modules.present.events.DownloadEvent;
	import org.bigbluebutton.modules.present.events.ExportEvent;
	import org.bigbluebutton.modules.present.events.GetAllPodsRespEvent;
	import org.bigbluebutton.modules.present.events.NewPresentationPodCreated;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.present.events.PresentationPodRemoved;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.model.PresentOptions;
	import org.bigbluebutton.modules.present.model.PresentationPodManager;
	import org.bigbluebutton.modules.present.model.PresentationWindowManager;
	import org.bigbluebutton.modules.present.ui.views.FileDownloadWindow;
	import org.bigbluebutton.modules.present.ui.views.FileExportWindow;
	import org.bigbluebutton.modules.present.ui.views.FileUploadWindow;
	import org.bigbluebutton.modules.present.ui.views.PresentationWindow;

	public class PresentManager
	{
		private var globalDispatcher:Dispatcher;
		private var winManager:PresentationWindowManager;
		private var podsManager: PresentationPodManager;
		private var presentOptions:PresentOptions;

		public function PresentManager() {
			globalDispatcher = new Dispatcher();
			podsManager = PresentationPodManager.getInstance();
			winManager = new PresentationWindowManager;
		}

		public function handleStartModuleEvent(e:PresentModuleEvent):void{
			if (!winManager.isEmpty()) { 
				return;
			}
			
			presentOptions = Options.getOptions(PresentOptions) as PresentOptions;

			winManager.initCollection(presentOptions.maxNumWindows);
		}

		public function handleAddPresentationPod(e: NewPresentationPodCreated): void {
			var podId: String = e.podId;
			var presenterId: String = e.presenterId;

			if(winManager.containsPodId(podId)) {
				// remove pod and replace with the updated version
				handlePresentationPodRemovedHelper(podId);
			}

			var newWindow:PresentationWindow = new PresentationWindow();
			newWindow.onPodCreated(podId, presenterId);

			var selectedWinId:String = winManager.addWindow(podId, newWindow, podId == PresentationPodManager.DEFAULT_POD_ID);

			if (selectedWinId != null) {
				newWindow.setWindowId(selectedWinId);

				podsManager.handleAddPresentationPod(podId);
				
				var openEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				openEvent.window = newWindow;
				globalDispatcher.dispatchEvent(openEvent);
			}
		}

		public function handlePresentationPodRemoved(e: PresentationPodRemoved): void {
			var podId: String = e.podId;

			handlePresentationPodRemovedHelper(podId);
		}

		private function handlePresentationPodRemovedHelper(podId: String): void {
			podsManager.handlePresentationPodRemoved(podId);

			var destroyWindow:PresentationWindow = winManager.findWindowByPodId(podId);
			if (destroyWindow != null) {
				var closeEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
				closeEvent.window = destroyWindow;
				globalDispatcher.dispatchEvent(closeEvent);

				winManager.removeWindow(podId);
			}
		}

		public function handleGetAllPodsRespEvent(e: GetAllPodsRespEvent): void {
			var podsAC:ArrayCollection = e.pods as ArrayCollection;
			podsManager.handleGetAllPodsResp(podsAC);
		}

		public function handleStopModuleEvent():void{
			var openWindows:Array = winManager.findAllWindows();
			for (var i:int=0; i<openWindows.length; i++) {
				openWindows[i].close();
			}
			
//			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
//			event.window = presentWindow;
//			globalDispatcher.dispatchEvent(event);
		}

		public function handleOpenUploadWindow(e:UploadEvent):void {
			// Never use "center" true with FileUploadWindow
			var uploadWindow : FileUploadWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, FileUploadWindow, false) as FileUploadWindow;
			if (uploadWindow) {
				uploadWindow.maxFileSize = e.maxFileSize;
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

		public function handleOpenDownloadWindow(e:DownloadEvent):void {
			var fileDownload : FileDownloadWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, FileDownloadWindow, true) as FileDownloadWindow;
			fileDownload.setPodId(e.podId);
		}

		public function handleCloseDownloadWindow():void {
			PopUpUtil.removePopUp(FileDownloadWindow);
		}
		
		public function handleOpenExportWindow(e:ExportEvent):void {
			var exportWindow:FileExportWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, FileExportWindow) as FileExportWindow;
			if (exportWindow) {
				exportWindow.firstPage = e.firstPage;
				exportWindow.numberOfPages = e.numberOfPages;
				exportWindow.slidesUrl = e.slidesUrl;
				exportWindow.slideModel = e.slideModel;
				exportWindow.presentationModel = e.presentationModel;
				exportWindow.whiteboardCanvas = e.whiteboardCanvas;
				exportWindow.initConversion();
			}
		}
		
		public function handleCloseExportWindow():void{
			PopUpUtil.removePopUp(FileExportWindow);
		}

	}
}
