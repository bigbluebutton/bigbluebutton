package org.bigbluebutton.modules.whiteboard.views.models
{
	public class SlideViewModel
	{
		public var viewportX:int = 0;
		public var viewportY:int = 0;
		public var viewportW:int = 0;
		public var viewportH:int = 0;
		
		public var viewedRegionX:int = 0;
		public var viewedRegionY:int = 0;
		public var viewedRegionW:int = 0;
		public var viewedRegionH:int = 0;
		
		public var pageOrigW:int = 0;
		public var pageOrigH:int = 0;
		
		public var parentW:int = 0;
		public var parentH:int = 0;
		
		public var loaderW:int = 0;
		public var loaderH:int = 0;
		public var loaderX:int = 0;
		public var loaderY:int = 0;
		
		public var fitToPage:Boolean = true;
		public var hasPageLoaded:Boolean = false;
		
		public var parentChange(parentW:int, parentH:int, fitToPage:Boolean):void {
			viewportW = this.parentW = parentW;
			viewportH = this.parentH = parentH;
			this.fitToPage = fitToPage;
		}
		
		public function calculateViewportSize():void {
			viewportW = parentW;
			viewportH = parentH;
						
			if (fitToPage) {
				// If the height is smaller than the width, we use the height as the 
				// base to determine the size of the slide.
				if (parentH < parentW) {					
					viewportH = parentH;
					viewportW = ((pageOrigW * viewportH)/pageOrigH);					
					LogUtil.debug("[" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");					
					if (parentW < viewportW) {
						viewportW = parentW;
						viewportH = ((pageOrigH * viewportW)/pageOrigW);
						LogUtil.debug("resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					}
				} else {
					viewportW = parentW;
					viewportH = ((pageOrigH * viewportW)/pageOrigW);
					LogUtil.debug("***** [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					if (parentH < viewportH) {
						viewportH = parentH;
						viewportW = ((pageOrigW * viewportH)/pageOrigH);
						LogUtil.debug("***** resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					}												
				}					
			} else {
				viewportW = parentW;
				viewportH = parentH;
				LogUtil.debug("FTW [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
			}		
		}	
		
		public function calcViewedRegion():void {
			calculateViewedRegionWidth();
			calculateViewedRegionHeight();
		}
		
		private function calculateViewedRegionWidth():void {
			viewedRegionX = (viewportW/loaderW) * pageOrigW;
			viewedRegionY = (viewportH/loaderH) * pageOrigH;
		}
		
		
		
		
	}
}