package org.bigbluebutton.lib.presentation.services {
	
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	
	public class PresentMessageReceiver implements IMessageListener {
		private static const OFFICE_DOC_CONVERSION_SUCCESS_KEY:String = "OFFICE_DOC_CONVERSION_SUCCESS";
		
		private static const OFFICE_DOC_CONVERSION_FAILED_KEY:String = "OFFICE_DOC_CONVERSION_FAILED";
		
		private static const SUPPORTED_DOCUMENT_KEY:String = "SUPPORTED_DOCUMENT";
		
		private static const UNSUPPORTED_DOCUMENT_KEY:String = "UNSUPPORTED_DOCUMENT";
		
		private static const PAGE_COUNT_FAILED_KEY:String = "PAGE_COUNT_FAILED";
		
		private static const PAGE_COUNT_EXCEEDED_KEY:String = "PAGE_COUNT_EXCEEDED";
		
		private static const GENERATED_SLIDE_KEY:String = "GENERATED_SLIDE";
		
		private static const GENERATING_THUMBNAIL_KEY:String = "GENERATING_THUMBNAIL";
		
		private static const GENERATED_THUMBNAIL_KEY:String = "GENERATED_THUMBNAIL";
		
		private static const CONVERSION_COMPLETED_KEY:String = "CONVERSION_COMPLETED";
		
		public var userSession:IUserSession;
		
		public function PresentMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {

				case "conversionUpdateMessageCallback":
					handleConversionUpdateMessageCallback(message);
					break;
				case "generatedSlideUpdateMessageCallback":
					handleGeneratedSlideUpdateMessageCallback(message);
					break;
				case "pageCountExceededUpdateMessageCallback":
					handlePageCountExceededUpdateMessageCallback(message);
					break;
				case "removePresentationCallback":
					handleRemovePresentationCallback(message);
					break;
				case "sharePresentationCallback":
					handleSharePresentationCallback(message);
					
					
					
					
				case "GetPresentationInfoRespMsg":
					handleGetPresentationInfoRespMsg(message)
					break;
				case "PresentationConversionCompletedEvtMsg":
					handlePresentationConversionCompletedEvtMsg(message);
					break;
				case "SetCurrentPageEvtMsg":
					handleSetCurrentPageEvtMsg(message);
					break;
				case "ResizeAndMovePageEvtMsg":
					handleResizeAndMovePageEvtMsg(message);
					break;
				default:
					break;
			}
		}
		
		private function handleGetPresentationInfoRespMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleGetPresentationInfoRespMsg()");
			var presentations:Array = msg.body.presentations as Array;
			if (msg.body.presentations) {
				for (var i:int = 0; i < presentations.length; i++) {
					addPresentation(presentations[i]);
				}
			}
		}
		
		private function addPresentation(presentationObject:Object):void {
			var length:int = presentationObject.pages.length;
			var presentation:Presentation = userSession.presentationList.addPresentation(presentationObject.name, presentationObject.id, length, presentationObject.current, presentationObject.downloadable);
			// Add all the slides to the presentation:
			for (var i:int = 0; i < length; i++) {
				var s:Object = presentationObject.pages[i];
				presentation.add(new Slide(s.id, s.num, s.swfUri, s.thumbUri, s.txtUri, s.current, s.xOffset, s.yOffset, s.widthRatio, s.heightRatio));
			}
			if (presentation.current) {
				presentation.show();
			}
		}
		
		public function handlePresentationConversionCompletedEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handlePresentationConversionCompletedEvtMsg() -- new presentation [" + msg.body.presentation.name + "] uploaded");
			addPresentation(msg.body.presentation);
		}
		
		private function handleSetCurrentPageEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleSetCurrentPageEvtMsg() -- going to slide number [" + msg.body.pageId + "]");
			userSession.presentationList.currentPresentation.setCurrentSlide(msg.body.pageId);
		}
		
		private function handleResizeAndMovePageEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleResizeAndMovePageEvtMsg()");
			userSession.presentationList.setViewedRegion(msg.body.presentationId, msg.body.pageId, msg.body.xOffset, msg.body.yOffset, msg.body.widthRatio, msg.body.heightRatio);
		}
		
		
		
		
		
		

		
		private function handleRemovePresentationCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handleRemovePresentationCallback() -- removing presentation  [" + msg.name + "]");
			userSession.presentationList.removePresentation(msg.name);
		}
		
		private function handleSharePresentationCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handleSharePresentationCallback() -- now showing presentation [" + msg.presentation.name + "]");
			var presentation:Presentation = userSession.presentationList.getPresentation(msg.presentation.name);
			if (presentation != null) {
				presentation.show();
			}
		}
		
		public function handlePageCountExceededUpdateMessageCallback(m:Object):void {
			trace("PresentMessageReceiver::handlePageCountExceededUpdateMessageCallback()");
		/*
		   var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.PAGE_COUNT_EXCEEDED);
		   uploadEvent.maximumSupportedNumberOfSlides = maxNumberOfPages;
		   dispatcher.dispatchEvent(uploadEvent);
		 */
		}
		
		public function handleGeneratedSlideUpdateMessageCallback(m:Object):void {
			trace("PresentMessageReceiver::handleGeneratedSlideUpdateMessageCallback()");
		/*
		   var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_UPDATE);
		   uploadEvent.totalSlides = numberOfPages;
		   uploadEvent.completedSlides = pagesCompleted;
		   dispatcher.dispatchEvent(uploadEvent);
		 */
		}
		
		public function handleConversionUpdateMessageCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handleConversionUpdateMessageCallback()");
			switch (m.messageKey) {
				case OFFICE_DOC_CONVERSION_SUCCESS_KEY:
					trace("received Office Doc Conversion Success");
					//uploadEvent = new UploadEvent(UploadEvent.OFFICE_DOC_CONVERSION_SUCCESS);
					//dispatcher.dispatchEvent(uploadEvent);
					break;
				case OFFICE_DOC_CONVERSION_FAILED_KEY:
					trace("received Office Doc Conversion Failed");
					//uploadEvent = new UploadEvent(UploadEvent.OFFICE_DOC_CONVERSION_FAILED);
					//dispatcher.dispatchEvent(uploadEvent);
					break;
				case SUPPORTED_DOCUMENT_KEY:
					trace("received Supported Document");
					//uploadEvent = new UploadEvent(UploadEvent.SUPPORTED_DOCUMENT);
					//dispatcher.dispatchEvent(uploadEvent);
					break;
				case UNSUPPORTED_DOCUMENT_KEY:
					trace("received Unsupported Document");
					//uploadEvent = new UploadEvent(UploadEvent.UNSUPPORTED_DOCUMENT);
					//dispatcher.dispatchEvent(uploadEvent);
					break;
				case GENERATING_THUMBNAIL_KEY:
					trace("received Generating Thumbnail");
					//dispatcher.dispatchEvent(new UploadEvent(UploadEvent.THUMBNAILS_UPDATE));
					break;
				case PAGE_COUNT_FAILED_KEY:
					trace("received Page Count Failed");
					//uploadEvent = new UploadEvent(UploadEvent.PAGE_COUNT_FAILED);
					//dispatcher.dispatchEvent(uploadEvent);
					break;
				case GENERATED_THUMBNAIL_KEY:
					trace("conversionUpdateMessageCallback:GENERATED_THUMBNAIL_KEY " + m.messageKey);
					break;
				default:
					trace("conversionUpdateMessageCallback:Unknown message " + m.messageKey);
					break;
			}
		}
	}
}
