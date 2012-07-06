package org.bigbluebutton.modules.present.services
{
	import flash.events.TimerEvent;
	
	import org.bigbluebutton.modules.present.events.PresenterCommands;
	import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
	import org.bigbluebutton.modules.present.events.SlideEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;

	public class PresentationService
	{
		public var uploadService:PresentationUploadService;
		public var soService:PresentationSOService;
		
		
		/**
		 * Start uploading the selected file 
		 * @param e
		 * 
		 */		
		public function startUpload(e:UploadEvent):void {
			uploadService.upload(e.presentationName, e.fileToUpload);
		}
		
		/**
		 * To to the specified slide 
		 * @param e - The event which holds the slide number
		 * 
		 */		
		public function gotoSlide(e:PresenterCommands):void{
			if (soService == null) return;
			soService.gotoSlide(e.slideNumber);
		}
		
		public function sharePresentation(e:PresenterCommands):void{
			if (soService == null) return;
			soService.sharePresentation(e.share, e.presentationName);
		}
		
		public function removePresentation(e:RemovePresentationEvent):void {
			if (soService == null) return;
			soService.removePresentation(e.presentationName);
		}
		
		private function sendViewerNotify(e:TimerEvent):void{
			if (soService == null) return;
			soService.gotoSlide(0);			
		}
		
		/**
		 * Move the slide within the presentation window 
		 * @param e
		 * 
		 */		
		public function moveSlide(e:PresenterCommands):void{
			soService.move(e.xOffset, e.yOffset, e.slideToCanvasWidthRatio, e.slideToCanvasHeightRatio);
		}
				
		/**
		 * Update the presenter cursor within the presentation window 
		 * @param e
		 * 
		 */		
		public function sendCursorUpdate(e:PresenterCommands):void{
			soService.sendCursorUpdate(e.xPercent, e.yPercent);
		}

	}
}