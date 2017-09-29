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
package org.bigbluebutton.modules.present.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import mx.collections.ArrayCollection;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.modules.present.commands.ChangePresentationCommand;
	import org.bigbluebutton.modules.present.commands.GoToNextPageCommand;
	import org.bigbluebutton.modules.present.commands.GoToPageCommand;
	import org.bigbluebutton.modules.present.commands.GoToPrevPageCommand;
	import org.bigbluebutton.modules.present.commands.UploadFileCommand;
	import org.bigbluebutton.modules.present.events.DownloadEvent;
	import org.bigbluebutton.modules.present.events.GetListOfPresentationsReply;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.present.events.PresenterCommands;
	import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.events.PresentationUploadTokenPass;
	import org.bigbluebutton.modules.present.events.PresentationUploadTokenFail;
	import org.bigbluebutton.modules.present.events.RequestClosePresentationPodEvent;
	import org.bigbluebutton.modules.present.events.RequestNewPresentationPodEvent;
	import org.bigbluebutton.modules.present.events.RequestPresentationInfoPodEvent;
	import org.bigbluebutton.modules.present.events.RequestAllPodsEvent;
	import org.bigbluebutton.modules.present.managers.PresentationSlides;
	import org.bigbluebutton.modules.present.model.Page;
	import org.bigbluebutton.modules.present.model.Presentation;
	import org.bigbluebutton.modules.present.model.PresentationPodManager;
	import org.bigbluebutton.modules.present.model.PresentationModel;
	import org.bigbluebutton.modules.present.services.PresentationService;
	import org.bigbluebutton.modules.present.services.messages.PageChangeVO;
	import org.bigbluebutton.modules.present.services.messaging.MessageReceiver;
	import org.bigbluebutton.modules.present.services.messaging.MessageSender;
	import org.bigbluebutton.main.api.JSLog;
	
	public class PresentProxy {
		private static const LOGGER:ILogger = getClassLogger(PresentProxy);

		private var host:String;
		private var conference:String;
		private var room:String;
		private var userid:Number;
		private var uploadService:FileUploadService;
		private var slides:PresentationSlides;
		private var sender:MessageSender;
		private var _messageReceiver:MessageReceiver;
    
		private var podManager: PresentationPodManager;
		private var service: PresentationService;
		private var currentUploadCommand: UploadFileCommand;

		public function PresentProxy() {
			JSLog.warn("+++ PresentProxy:: constructor: ", {});

			podManager = PresentationPodManager.getInstance();

			slides = new PresentationSlides();
			sender = new MessageSender();
			service = new PresentationService();
		}

		public function getCurrentPresentationInfo():void {
			podManager.requestAllPodsPresentationInfo();
		}

		public function handleRequestAllPodsEvent(e: RequestAllPodsEvent):void {
			sender.requestAllPodsEvent();
		}

		public function connect(e:PresentModuleEvent):void {
			extractAttributes(e.data);

			podManager.requestAllPodsPresentationInfo(); // Instead of sender.getPresentationInfo();     
		}

		private function extractAttributes(a:Object):void{
			host = a.host as String;
			conference = a.conference as String;
			room = a.room as String;
			userid = a.userid as Number;
		}
    
    public function handleGetListOfPresentationsRequest():void {
      var presos:ArrayCollection = PresentationModel.getInstance().getPresentations();
      var idAndName:Array = new Array();
      for (var i:int = 0; i < presos.length; i++) {
        var pres:Presentation = presos.getItemAt(i) as Presentation;
        var p:Object = new Object();
        p.id = pres.id;
        p.name = pres.name;
        idAndName.push(p);
      }
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new GetListOfPresentationsReply(idAndName));
    }

		private function handleRequestPresentationInfoPodEvent(e: RequestPresentationInfoPodEvent): void {
			sender.getPresentationInfo(e.podId);
		}
    
    public function handleChangePresentationCommand(cmd:ChangePresentationCommand):void {
//      var pres:Presentation = PresentationModel.getInstance().getPresentation(cmd.presId);
//      JSLog.warn("+++ PresentProxy:: sharePresentation2: " + pres.id, {});
//		
//		
//      if (pres != null) {
//        sender.sharePresentation(pres.id);
//      }
    }
    
    public function handleGoToPageCommand(cmd:GoToPageCommand):void {
//      var pageChangeVO:PageChangeVO = PresentationModel.getInstance().getSpecificPageIds(cmd.pageId);
//      if (pageChangeVO != null) {
//        LOGGER.debug("Going to page[{0}] from presentation[{1}]", [pageChangeVO.pageId, pageChangeVO.presentationId]);
//        sender.goToPage(pageChangeVO.presentationId, pageChangeVO.pageId);
//      } else {
//        LOGGER.debug("Could not go to selected page. Might not exist or is already current");
//      }
    }
    
    public function handleGoToPreviousPageCommand(cmd:GoToPrevPageCommand):void {
//      var pageChangeVO:PageChangeVO = PresentationModel.getInstance().getPrevPageIds();
//      if (pageChangeVO != null) {
//        LOGGER.debug("Going to prev page[{0}] from presentation[{1}]", [pageChangeVO.pageId, pageChangeVO.presentationId]);
//        sender.goToPage(pageChangeVO.presentationId, pageChangeVO.pageId);
//      } else {
//        LOGGER.debug("Could not find previous page to change to");
//      }
    }
    
    public function handleGoToNextPageCommand(cmd:GoToNextPageCommand):void {
//      var pageChangeVO:PageChangeVO = PresentationModel.getInstance().getNextPageIds();
//      if (pageChangeVO != null) {
//        LOGGER.debug("Going to prev page[{0}] from presentation[{1}]", [pageChangeVO.pageId, pageChangeVO.presentationId]);
//        sender.goToPage(pageChangeVO.presentationId, pageChangeVO.pageId);
//      } else {
//        LOGGER.debug("Could not find previous page to change to");
//      }
    }

		/**
		 * Start uploading the selected file 
		 * @param e
		 * 
		 */
		public function startUpload(e: PresentationUploadTokenPass):void {
			LOGGER.debug("Uploading presentation [{0}]", [e.filename]);

			if (uploadService == null) {
				uploadService = new FileUploadService(host + "/bigbluebutton/presentation/" + e.token + "/upload", conference, room);
			}

			if (currentUploadCommand != null && currentUploadCommand.filename == e.filename) {
				uploadService.upload(currentUploadCommand.podId, currentUploadCommand.filename, currentUploadCommand.file, currentUploadCommand.isDownloadable);
				currentUploadCommand = null;
			} else {

			}
		}

		/**
		 * Cancel uploading the selected file
		 * @param e
		 *
		 */
		public function cancelUpload(e: PresentationUploadTokenFail):void {
			LOGGER.debug("Cancel uploading presentation [{0}]", [e.filename]);

			currentUploadCommand = null;

			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new UploadEvent(UploadEvent.CLOSE_UPLOAD_WINDOW));
		}

		/**
		 * Request an authorization token to proceed with uploading of the selected file
		 * @param e
		 *
		 */
		public function requestUploadToken(e:UploadFileCommand):void{
			currentUploadCommand = e;
			sender.requestPresentationUploadPermission(e.podId, e.filename);
		}

		/**
		 * Start downloading the selected file
		 * @param e
		 *
		 */
		public function startDownload(e:DownloadEvent):void {
			var presentationName:String = e.fileNameToDownload;
			var downloadUri:String = host + "/bigbluebutton/presentation/" + conference + "/" + room + "/" + presentationName + "/download";
			LOGGER.debug("PresentationApplication::downloadPresentation()... " + downloadUri);
			var req:URLRequest = new URLRequest(downloadUri);
			navigateToURL(req,"_blank");
		}
				
		/**
		 * Loads a presentation from the server. creates a new PresentationService class 
		 * 
		 */		
		public function loadPresentation(e:UploadEvent) : void
		{
			var presentationName:String = e.presentationName;
			LOGGER.debug("PresentProxy::loadPresentation: presentationName={0}", [presentationName]);
			var fullUri : String = host + "/bigbluebutton/presentation/" + conference + "/" + room + "/" + presentationName+"/slides";	
			var slideUri:String = host + "/bigbluebutton/presentation/" + conference + "/" + room + "/" + presentationName;
			
			LOGGER.debug("PresentationApplication::loadPresentation()... {0}", [fullUri]);
//			var service:PresentationService = new PresentationService();
//			service.load(fullUri, slides, slideUri);
			LOGGER.debug('number of slides={0}', [slides.size()]);
		}
		
		/**
		 * It may take a few seconds for the process to complete on the server, so we allow for some time 
		 * before notifying viewers the presentation has been loaded 
		 * @param e
		 * 
		 */		
		public function sharePresentation(e:PresenterCommands):void{
			JSLog.warn("+++ PresentProxy:: sharePresentation1: " + e.presentationName, {});
			JSLog.warn("+++ PresentProxy:: sharePresentation2: " + e.podId, {});
      		sender.sharePresentation(e.presentationName);
		}
		
		public function removePresentation(e:RemovePresentationEvent):void {
			sender.removePresentation(e.presentationName);
		}
		
		/**
		 * Zoom the slide within the presentation window
		 * @param e
		 * 
		 */		
		public function zoomSlide(e:PresenterCommands):void{
//			var currentPresentation:Presentation = PresentationModel.getInstance().getCurrentPresentation();
//      if (currentPresentation == null) return;
//      
//			var currentPage:Page = PresentationModel.getInstance().getCurrentPage();
//			
//			sender.move(currentPresentation.id, currentPage.id, e.xOffset, e.yOffset, e.slideToCanvasWidthRatio, e.slideToCanvasHeightRatio);
		}

		/**
		 * Request the creation of a new presentation pod
		 * @param e
		 * 
		 */
		public function handleRequestNewPresentationPod(e: RequestNewPresentationPodEvent): void {
			sender.requestNewPresentationPod(e.requesterId);
		}

		/**
		 * Request the removal of a specific presentation pod
		 * @param e
		 * 
		 */
		public function handleRequestClosePresentationPod(e: RequestClosePresentationPodEvent): void {
			sender.requestClosePresentationPod(e.requesterId, e.podId);
		}
	}
}
