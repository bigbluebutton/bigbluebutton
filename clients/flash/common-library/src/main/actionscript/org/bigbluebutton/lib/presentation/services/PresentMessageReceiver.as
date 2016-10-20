package org.bigbluebutton.lib.presentation.services {
	
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	
	public class PresentMessageReceiver implements IMessageListener {
		private static const SO_NAME:String = "presentationSO";
		
		private static const PRESENTER:String = "presenter";
		
		private static const SHARING:String = "sharing";
		
		private static const UPDATE_MESSAGE:String = "updateMessage";
		
		private static const CURRENT_PAGE:String = "currentPage";
		
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
				case "PresentationCursorUpdateCommand":
					handlePresentationCursorUpdateCommand(message);
					break;
				case "moveCallback":
					handleMoveCallback(message);
					break;
				case "goToSlideCallback":
					handleGoToSlideCallback(message);
					break;
				case "conversionCompletedUpdateMessageCallback":
					handleConversionCompletedUpdateMessageCallback(message);
					break;
				case "conversionUpdateMessageCallback":
					handleConversionUpdateMessageCallback(message);
					break;
				case "generatedSlideUpdateMessageCallback":
					handleGeneratedSlideUpdateMessageCallback(message);
					break;
				case "getPresentationInfoReply":
					handleGetPresentationInfoReply(message)
					break;
				case "pageCountExceededUpdateMessageCallback":
					handlePageCountExceededUpdateMessageCallback(message);
					break;
				case "removePresentationCallback":
					handleRemovePresentationCallback(message);
					break;
				case "sharePresentationCallback":
					handleSharePresentationCallback(message);
				default:
					break;
			}
		}
		
		private function handleGetPresentationInfoReply(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			if (msg.presentations) {
				for (var i:int = 0; i < msg.presentations.length; i++) {
					addPresentation(msg.presentations[i]);
				}
			}
		}
		
		private function handleGoToSlideCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handleGoToSlideCallback() -- going to slide number [" + msg.num + "]");
			userSession.presentationList.currentPresentation.currentSlideNum = int(msg.num);
		}
		
		private function handleMoveCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handleMoveCallback()");
			userSession.presentationList.setViewedRegion(msg.xOffset, msg.yOffset, msg.widthRatio, msg.heightRatio);
		/* Properties of msg:
		   current
		   heightRatio
		   id
		   num
		   pngUri
		   swfUri
		   thumbUri
		   txtUri
		   widthRatio
		   xOffset
		   yOffset
		   /*
		
		   /*
		   var e:MoveEvent = new MoveEvent(MoveEvent.MOVE);
		   e.xOffset = xOffset;
		   e.yOffset = yOffset;
		   e.slideToCanvasWidthRatio = widthRatio;
		   e.slideToCanvasHeightRatio = heightRatio;
		   dispatcher.dispatchEvent(e);
		 */
		}
		
		private function handlePresentationCursorUpdateCommand(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handlePresentationCursorUpdateCommand() -- cursing moving [" + msg.xPercent + ", " + msg.yPercent + "]");
			userSession.presentationList.cursorUpdate(msg.xPercent, msg.yPercent);
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
		
		public function handleConversionCompletedUpdateMessageCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("PresentMessageReceiver::handleConversionCompletedUpdateMessageCallback() -- new presentation [" + msg.presentation.name + "] uploaded");
			addPresentation(msg.presentation);
		}
		
		private function addPresentation(presentationObject:Object):void {
			var length:int = presentationObject.pages.length;
			trace("PresentMessageReceiver::handleGetPresentationInfoReply() -- adding presentation [" + presentationObject.name + "] to the presentation list");
			var presentation:Presentation = userSession.presentationList.addPresentation(presentationObject.name, presentationObject.id, length, presentationObject.current);
			// Add all the slides to the presentation:
			for (var i:int = 0; i < length; i++) {
				var s:Object = presentationObject.pages[i];
				if (s.swfUri) {
					presentation.add(new Slide(s.num, s.swfUri, s.thumbUri, s.txtUri, s.current, s.xOffset, s.yOffset, s.widthRatio, s.heightRatio));
				} else if (s.swf_uri) {
					presentation.add(new Slide(s.num, s.swf_uri, s.thumb_uri, s.txt_uri, s.current, s.x_offset, s.y_offset, s.width_ratio, s.height_ratio));
				}
			}
			if (presentation.current) {
				presentation.show();
			}
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
