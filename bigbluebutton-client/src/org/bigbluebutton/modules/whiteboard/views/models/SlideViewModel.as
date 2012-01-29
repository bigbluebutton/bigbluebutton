package org.bigbluebutton.modules.whiteboard.views.models
{
	import org.bigbluebutton.common.LogUtil;

	[Bindable]
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
		
		private var _pageOrigW:int = 0;
		private var _pageOrigH:int = 0;
		
		private var _parentW:int = 0;
		private var _parentH:int = 0;
		
		public var loaderW:int = 0;
		public var loaderH:int = 0;
		public var loaderX:int = 0;
		public var loaderY:int = 0;
		
		public var fitToPage:Boolean = true;
		public var hasPageLoaded:Boolean = false;
		
		public function set parentW(width:int):void {
			_parentW = width;
		}

		public function set parentH(height:int):void {
			_parentH = height;
		}
		
		public function get parentW():int {
			return _parentW;
		}
		
		public function get parentH():int {
			return _parentH;
		}
		
		public function set pageOrigW(width:int):void {
			_pageOrigW = width;
		}
		
		public function set pageOrigH(height:int):void {
			_pageOrigH = height;
		}
		
		public function get pageOrigW():int {
			return _pageOrigW;
		}
		
		public function get pageOrigH():int {
			return _pageOrigH;
		}
		public function parentChange(parentW:int, parentH:int, fitToPage:Boolean):void {
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
					LogUtil.debug("calc viewport [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");					
					if (parentW < viewportW) {
						viewportW = parentW;
						viewportH = ((pageOrigH * viewportW)/pageOrigW);
						LogUtil.debug("calc viewport resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					}
				} else {
					viewportW = parentW;
					viewportH = ((pageOrigH * viewportW)/pageOrigW);
					LogUtil.debug("calc viewport ***** [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					if (parentH < viewportH) {
						viewportH = parentH;
						viewportW = ((pageOrigW * viewportH)/pageOrigH);
						LogUtil.debug("calc viewport ***** resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					}												
				}					
			} else {
				viewportW = parentW;
				viewportH = parentH;
				LogUtil.debug("calc viewport FTW [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
			}		
		}	
		
		public function printViewedRegion():void {
			LogUtil.debug("Region [" + viewedRegionW + "," + viewedRegionH + "] [" + viewedRegionX + "," + viewedRegionY + "]");			
		}
		
		public function calcViewedRegion():void {
			calcViewedRegionWidth();
			calcViewedX();
			calcViewedY();
		}
		
		private function calcViewedRegionWidth():void {
			if (fitToPage) {
				if (viewedRegionW == pageOrigW) {
					viewedRegionW = pageOrigW;
				} else {
					viewedRegionW = (viewportW/loaderW) * pageOrigW;
					if (viewedRegionW >= loaderW) {
						viewedRegionW = pageOrigW;
					}
				}
				
				if (viewedRegionH == pageOrigH) {
					viewedRegionH = pageOrigH;
				} else {
					viewedRegionH = (viewportH/loaderH) * pageOrigH;
					if (viewedRegionH >= loaderH) {
						viewedRegionH = pageOrigH;
					}
				}				
			} else {
				viewedRegionW = pageOrigW;
					viewedRegionH = (viewportH/viewportW) * pageOrigH;
			}
		}
		
		private function calcViewedX():void {
			viewedRegionX = Math.abs((pageOrigW/loaderW) * loaderX);
		}
		
		private function calcViewedY():void {
			viewedRegionY = Math.abs((pageOrigH/loaderH) * loaderY);
		}
		
		public function resizeAndMoveLoaderBy(percent:Number):void {	
			// Save the old loader dimensions. We need these to calculate
			// the new position of the loader;
			var oldLoaderHeight:int = loaderH;
			var oldLoaderWidth:int = loaderW;
			
			loaderW = viewportW * percent/100; 
			loaderH = viewportH * percent/100;
			
			loaderX = calculateNewLoaderX(oldLoaderWidth);
			loaderY = calculateNewLoaderY(oldLoaderHeight);
		}
		
		/**
		 * Determines the new y coordinate of the loader. This determines if the location has
		 * changed because the slide was resized or moved.
		 */
		private function calculateNewLoaderY(oldLoaderHeight:int):int {				
			var deltaPercentHeight:Number = (loaderH - oldLoaderHeight) /oldLoaderHeight;
			
			var newLoaderY:int = (loaderY/loaderH) * deltaPercentHeight;				
			if (newLoaderY == 0) {
				newLoaderY = loaderY - (deltaPercentHeight * 100);
			} else {
				newLoaderY = loaderY - newLoaderY;
			}
//			if (newLoaderY > 0) newLoaderY = 0;
			return newLoaderY;
		}
		
		/**
		 * Determines the new y coordinate of the loader. This determines if the location has
		 * changed because the slide was resized or moved.
		 */
		private function calculateNewLoaderX(oldLoaderWidth:int):int {				
			var deltaPercentWidth:Number = (loaderW - oldLoaderWidth) / oldLoaderWidth;
			var newLoaderX:int = (loaderX/loaderW) * deltaPercentWidth;
			if (newLoaderX == 0) {
				newLoaderX = loaderX - (deltaPercentWidth * 100);
			} else {
				newLoaderX = loaderX - newLoaderX;
			}		
			
//			if (newLoaderX > 0) newLoaderX = 0;
			return newLoaderX;		
		}		
		
		public function allowMoveX(newX:int):int {
			if (newX > 0) {
//				LogUtil.debug("LoaderX is getting into viewport " + newX);
				return 0;
			}
			if ((loaderW + newX) < viewportW) return (viewportW - loaderW);
			
//			LogUtil.debug("LoaderX is NOT getting into viewport " + newX);
			return newX;
		}
		
		public function allowMoveY(newY:int):int {
			if (newY > 0) {
//				LogUtil.debug("LoaderY is getting into viewport " + newY);
				return 0;
			}			
			
			if ((loaderH + newY) < viewportH) return (viewportH - loaderH);
			
//			LogUtil.debug("LoaderY is NOT getting into viewport " + newY);
			return newY;
		}
		
		public function moveLoader(newX:int, newY:int):void {
			loaderX = newX;
			loaderY = newY;
		}
		
		public function displayRegion(x:int, y:int, width:int, height:int):void {
			loaderW = (viewportW*pageOrigW)/width;
			LogUtil.debug("calc loaderW [(" + viewportW + "*" + pageOrigW + ")/" + width + "=" + loaderW + "]");
			loaderH = (viewportH*pageOrigH)/height;
			LogUtil.debug("calc loaderH [(" + viewportH + "*" + pageOrigH + ")/" + height + "=" + loaderH + "]");
			loaderX = (x*loaderW)/pageOrigW;
			LogUtil.debug("calc loaderX [(" + x + "*" + loaderW + ")/" + pageOrigW + "=" + loaderX + "]");
			loaderY = (y*loaderH)/pageOrigH;
			LogUtil.debug("calc loaderY [(" + y + "*" + loaderH + ")/" + pageOrigH + "=" + loaderY + "]");
			LogUtil.debug("Displaying [" + loaderW + "," + loaderH + "] [" + loaderX + "," + loaderY + "]");			
		}
		
	}
}