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
	
	import mx.collections.ArrayCollection;
	import mx.managers.PopUpManager;
	import mx.managers.SystemManager;
	import mx.core.Application;
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.Conference;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.present.events.QueryListOfPresentationsReplyEvent;
	import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
	import org.bigbluebutton.modules.present.events.DownloadEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.ui.views.FileDownloadWindow;
	import org.bigbluebutton.modules.present.ui.views.FileUploadWindow;
	import org.bigbluebutton.modules.present.ui.views.PresentationWindow;
	
	public class PresentManager
	{
		private var globalDispatcher:Dispatcher;
		private var downloadWindow:FileDownloadWindow;
		private var uploadWindow:FileUploadWindow;
		private var presentWindow:PresentationWindow;
		
		//format: presentationInfos = [{label:"00"}, {label:"11"}, {label:"22"} ];
		[Bindable] public var presentationInfos:ArrayCollection = new ArrayCollection();
		[Bindable] public var fileNamesToDownload:ArrayCollection = new ArrayCollection();
		
		public function PresentManager() {
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent(e:PresentModuleEvent):void{
			if (presentWindow != null){ 
				return;
			}
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

		public function handleOpenDownloadWindow():void{
			if (downloadWindow != null) return;
		
			downloadWindow = new FileDownloadWindow();

			var width:int = Application(FlexGlobals.topLevelApplication).systemManager.screen.width;
			var height:int = Application(FlexGlobals.topLevelApplication).systemManager.screen.height;

			downloadWindow.x = (width - downloadWindow.width) / 2;
                        downloadWindow.y = (height - downloadWindow.height) / 2;
	
			downloadWindow.fileNamesToDownload = fileNamesToDownload;
	
			mx.managers.PopUpManager.addPopUp(downloadWindow, presentWindow, true);
		}
		
		public function handleCloseDownloadWindow():void{
			PopUpManager.removePopUp(downloadWindow);
			downloadWindow = null;
		}
	
		public function handleOpenUploadWindow(e:UploadEvent):void{
			if (uploadWindow != null) return;
			
			uploadWindow = new FileUploadWindow();

			var width:int = Application(FlexGlobals.topLevelApplication).systemManager.screen.width;
			var height:int = Application(FlexGlobals.topLevelApplication).systemManager.screen.height;

			uploadWindow.x = (width - uploadWindow.width) / 2;
                        uploadWindow.y = (height - uploadWindow.height) / 2;
		 
			uploadWindow.presentationInfosAC = presentationInfos;		

			uploadWindow.maxFileSize = e.maxFileSize;
			
			mx.managers.PopUpManager.addPopUp(uploadWindow, presentWindow, true);
			 
		}
		
		public function handleCloseUploadWindow():void{
			PopUpManager.removePopUp(uploadWindow);
			uploadWindow = null;
			globalDispatcher.dispatchEvent(new DownloadEvent(DownloadEvent.UPDATE_FILE_NAMES));			
		}
		
		public function updatePresentationNames(e:UploadEvent):void{
			for (var i:int = 0; i < presentationInfos.length; i++) {
				if (presentationInfos[i].presentationName == e.presentationName) return;
			}

			var newPresentationInfo:Object = new Object();
			newPresentationInfo.presentationName = e.presentationName;
			newPresentationInfo.isDownloadable = false;

			LogUtil.debug("Presentation Info: name =  " + newPresentationInfo.presentationName);
			LogUtil.debug("Presentation Info: downloadable?   " + newPresentationInfo.isDownloadable);
			presentationInfos.addItem(newPresentationInfo);		
		}

		public function updateFileNamesToDownload(e:DownloadEvent):void{
			LogUtil.debug("Adding file NAME " + e.fileNameToDownload);
			for (var i:int = 0; i < fileNamesToDownload.length; i++) {
				if (fileNamesToDownload[i] == e.fileNameToDownload) return;
			}
		
			fileNamesToDownload.addItem(e.fileNameToDownload);
			updateDownloadablePresentations(e.fileNameToDownload);
		
		}


		public function removePresentation(e:RemovePresentationEvent):void {
			LogUtil.debug("Removing presentation " + e.presentationName);
		        var p:String;
		      
		        for (var i:int = 0; i < presentationInfos.length; i++) {
			  p = presentationInfos.getItemAt(i).presentationName as String;
			  if (p == e.presentationName) {
			    presentationInfos.removeItemAt(i);
			  }
     		        }

			removeFileNameToDownload(e.presentationName);
		}


		public function removeFileNameToDownload(presentationName:String):void {
      			var p:String;
      
		        for (var i:int = 0; i < fileNamesToDownload.length; i++) {
			  p = getPresentationName(fileNamesToDownload.getItemAt(i) as String);
			  if (p == presentationName) {
			     LogUtil.debug("Removing file name to download " + presentationName);
			     fileNamesToDownload.removeItemAt(i);
			  }
		        }
		}


		private function updateDownloadablePresentations(fileName:String):void 
		{
			LogUtil.debug("Updating isDownloadable field ");
			
			var info:Object;

		        for (var i:int = 0; i < presentationInfos.length; i++) {
			    info = presentationInfos.getItemAt(i) as Object;
			    if(info.presentationName == getPresentationName(fileName)) {
				LogUtil.debug("Now we check the downloadable mark on the user interface (" + info.presentationName + ")");
				info.isDownloadable = true;
				presentationInfos.setItemAt(info,i);
			    }			
			}
					
		}


		private function getPresentationName(fileName:String):String
		{
		   var filenamePattern:RegExp = /(.+)(\..+)/i;
          	   // Get the first match which should be the filename without the extension.
          	   return fileName.replace(filenamePattern, "$1")
		}

    
    public function queryPresentations():void {
      var pArray:Array = new Array();
      var pName:String;

      // here make a new array with the presentationNames only
      //pArray = presentationInfos.toArray();

      for (var i:int = 0; i < presentationInfos.length; i++) {
	  pName = presentationInfos.getItemAt(i).presentationName as String;
	  pArray.push(pName);		 
      }

      LogUtil.debug("$ending... " + pArray);
      
      var qEvent:QueryListOfPresentationsReplyEvent = new QueryListOfPresentationsReplyEvent();
      qEvent.presentations = pArray;
      globalDispatcher.dispatchEvent(qEvent);
    }
	}
}
