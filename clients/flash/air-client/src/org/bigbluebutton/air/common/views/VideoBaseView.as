package org.bigbluebutton.air.common.views {
	import flash.display.DisplayObject;
	
	import mx.core.UIComponent;
	
	public class VideoBaseView extends UIComponent {
		protected var videoComp:DisplayObject;
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		public function resizeForLandscape():void {
			if (height < width) {
				videoComp.height = width;
				videoComp.width = ((originalVideoWidth * videoComp.height) / originalVideoHeight);
				if (width < videoComp.width) {
					videoComp.width = height;
					videoComp.height = (videoComp.width / originalVideoWidth) * originalVideoHeight;
				}
			} else {
				videoComp.width = height;
				videoComp.height = (videoComp.width / originalVideoWidth) * originalVideoHeight;
				if (height < videoComp.height) {
					videoComp.height = width;
					videoComp.width = ((originalVideoWidth * videoComp.height) / originalVideoHeight);
				}
			}
		}
		
		public function resizeForPortrait():void {
			// if we have device where screen width less than screen height e.g. phone
			if (width < height) {
				// make the video width full width of the screen 
				videoComp.width = width;
				// calculate height based on a video width, it order to keep the same aspect ratio
				videoComp.height = (videoComp.width / originalVideoWidth) * originalVideoHeight;
				// if calculated height appeared to be bigger than screen height, recalculuate the video size based on width
				if (height < videoComp.height) {
					// make the video height full height of the screen
					videoComp.height = height;
					// calculate width based on a video height, it order to keep the same aspect ratio
					videoComp.width = ((originalVideoWidth * videoComp.height) / originalVideoHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				videoComp.height = height;
				// calculate width based on a video height, it order to keep the same aspect ratio
				videoComp.width = ((originalVideoWidth * videoComp.height) / originalVideoHeight);
				// if calculated width appeared to be bigger than screen width, recalculuate the video size based on height
				if (width < videoComp.width) {
					// make the video width full width of the screen 
					videoComp.width = width;
					// calculate height based on a video width, it order to keep the same aspect ratio
					videoComp.height = (videoComp.width / originalVideoWidth) * originalVideoHeight;
				}
			}
			
			videoComp.x = width - videoComp.width;
			videoComp.y = height - videoComp.height;
		}
	
	}
}
