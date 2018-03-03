package org.bigbluebutton.air.presentation.services {
	
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.presentation.models.Presentation;
	import org.bigbluebutton.air.presentation.models.Slide;
	
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
		
		private static const DEFAULT_POD_ID:String = "DEFAULT_PRESENTATION_POD";
		
		public var userSession:IUserSession;
		
		public function PresentMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "GetAllPresentationPodsRespMsg":
					handleGetAllPresentationPodsRespMsg(message)
					break;
				case "PresentationConversionCompletedEvtMsg":
					handlePresentationConversionCompletedEvtMsg(message);
					break;
				case "SetCurrentPageEvtMsg":
					handleSetCurrentPageEvtMsg(message);
					break;
				case "SetCurrentPresentationEvtMsg":
					handleSetCurrentPresentationEvtMsg(message);
					break;
				case "ResizeAndMovePageEvtMsg":
					handleResizeAndMovePageEvtMsg(message);
					break;
				case "RemovePresentationEvtMsg":
					handleRemovePresentationEvtMsg(message);
					break;
				default:
					break;
			}
		}
		
		private function handleGetAllPresentationPodsRespMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleGetAllPresentationPodsRespMsg()");
			var podsArr:Array = msg.body.pods as Array;
			for (var j:int = 0; j < podsArr.length; j++) {
				var podObj:Object = podsArr[j] as Object;
				if (podObj.id == DEFAULT_POD_ID) {
					var presentations:Array = podObj.presentations as Array;
					for (var k:int = 0; k < presentations.length; k++) {
						addPresentation(presentations[k] as Object);
					}
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
				userSession.presentationList.setCurrentPresentation(presentationObject.id);
			}
		}
		
		public function handlePresentationConversionCompletedEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handlePresentationConversionCompletedEvtMsg() -- new presentation [" + msg.body.presentation.name + "] uploaded");
			if (msg.body.podId == DEFAULT_POD_ID) {
				addPresentation(msg.body.presentation);
			}
		}
		
		public function handleSetCurrentPresentationEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleSetCurrentPresentationEvtMsg() -- change current presentation [" + msg.body.presentationId + "]");
			if (msg.body.podId == DEFAULT_POD_ID) {
				userSession.presentationList.setCurrentPresentation(msg.body.presentationId);
			}
		}
		
		private function handleSetCurrentPageEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleSetCurrentPageEvtMsg() -- going to slide number [" + msg.body.pageId + "]");
			if (msg.body.podId == DEFAULT_POD_ID) {
				userSession.presentationList.setCurrentSlide(msg.body.presentationId, msg.body.pageId);
			}
		}
		
		private function handleResizeAndMovePageEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleResizeAndMovePageEvtMsg()");
			if (msg.body.podId == DEFAULT_POD_ID) {
				userSession.presentationList.setViewedRegion(msg.body.presentationId, msg.body.pageId, msg.body.xOffset, msg.body.yOffset, msg.body.widthRatio, msg.body.heightRatio);
			}
		}
		
		private function handleRemovePresentationEvtMsg(msg:Object):void {
			trace("PresentMessageReceiver::handleRemovePresentationEvtMsg() -- removing presentation  [" + msg.body.presentationId + "]");
			if (msg.body.podId == DEFAULT_POD_ID) {
				userSession.presentationList.removePresentation(msg.body.presentationId);
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
