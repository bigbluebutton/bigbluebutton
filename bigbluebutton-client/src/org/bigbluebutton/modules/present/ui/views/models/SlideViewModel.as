package org.bigbluebutton.modules.present.ui.views.models
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
		private var _calcPageW:int = 0;
		private var _calcPageH:int = 0;
		private var _calcPageX:int = 0;
		private var _calcPageY:int = 0;
		
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
			
		public function get pageOrigW():int {
			return _pageOrigW;
		}
		
		public function get pageOrigH():int {
			return _pageOrigH;
		}
		
		public function reset(pageWidth:int, pageHeight:int):void {
			_pageOrigW = pageWidth;
			_pageOrigH = pageHeight;
			viewedRegionW = loaderW = _pageOrigW;
			viewedRegionH = loaderH = _pageOrigH;
			loaderX = 0;
			loaderY = 0;			
		}
		
		public function parentChange(parentW:int, parentH:int, fitToPage:Boolean):void {
			viewportW = this.parentW = parentW;
			viewportH = this.parentH = parentH;
			this.fitToPage = fitToPage;
		}
		
		public function calcViewedRegion():void {
			if (fitToPage) {
				viewedRegionW = (viewportW/_calcPageW) * _pageOrigW;
				viewedRegionH = (viewportH/_calcPageH) * _pageOrigH;
			} else {
				viewedRegionW = _pageOrigW;
				viewedRegionH = (viewportH/_calcPageH) * _pageOrigH;
			}
		}
		
		public function calcCalcPageSize():void {
			if (fitToPage) {
				_calcPageW = (viewportW/viewedRegionW) * _pageOrigW;
				_calcPageH = (viewportH/viewedRegionH) * _pageOrigH;
			} else {
				_calcPageW = viewportW;
				_calcPageH = (_calcPageW/_pageOrigW) * _pageOrigH;
			}
		}
		
		public function calcViewedRegionXY():void {
			if (fitToPage) {
				viewedRegionX = (_calcPageW/_pageOrigW) * _calcPageX;
				viewedRegionY = (_calcPageH/_pageOrigH) * _calcPageY;
			} else {
				viewedRegionX = 0;
				viewedRegionY = (_calcPageH/_pageOrigH) * _calcPageY;
			}
		}
		
		public function displayPresenterView():void {
			loaderX = _calcPageX;
			loaderY = _calcPageY;
			loaderW = _calcPageW;
			loaderH = _calcPageH;
		}
		
		private var _pageXOnStart:int = 0;
		private var _pageYOnStart:int = 0;
		
		public function onMoveStart():void {
			_pageXOnStart = _calcPageX;
			_pageYOnStart = _calcPageY;
		}

		public function onResizeMove(vpx:int, vpy:int):void {
			if (fitToPage) {
				//
			} else {
				_calcPageX = 0;
//				LogUtil.debug("onResizeMove [" + vpx + "," + vpy + "] [" + _calcPageH + "," + viewportH + "] [" + _calcPageY + "]");	
				if ((_calcPageH + _calcPageY*2) < viewportH) {
					// After lots of trial and error on why move doesn't work properly, I found I had to 
					// multiply the y by 2. Don't know why I need to double the delta to align the edges.
					_calcPageY =  (viewportH - _calcPageH)/2;
				} 								
			}
		}
		
		public function onMove(deltaX:int, deltaY:int):void {
			if (fitToPage) {	
				_calcPageX += deltaX;
				_calcPageY += deltaY;
				
//				if ((newX) > 0) _calcPageX = 0;
//				else if ((Math.abs(newX) + viewportW) > _calcPageW) {
//					_calcPageX = viewportW - _calcPageW;
//				} else {
//					_calcPageX = newX;
//				}
			} else {				
				_calcPageX = 0
			}
			
			LogUtil.debug("** calcPageY [" + deltaX + "," + deltaY + "] [" + _calcPageY + "<" + viewportH + "]");									

			var newY:int = _calcPageY + deltaY;
			
			if (newY > 0) _calcPageY = 0;
			else if ((_calcPageH + newY*2) < viewportH) {
//				LogUtil.debug("calcPageY [" + _calcPageH + "," + _calcPageY + "] [" + (_calcPageH + _calcPageY) + "<" + viewportH + "] [" + _calcPageY + "]");						
			} else {
				_calcPageY = newY;
			}					
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
//					LogUtil.debug("calc viewport [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");					
					if (parentW < viewportW) {
						viewportW = parentW;
						viewportH = ((pageOrigH * viewportW)/pageOrigW);
//						LogUtil.debug("calc viewport resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					}
				} else {
					viewportW = parentW;
					viewportH = ((pageOrigH * viewportW)/pageOrigW);
//					LogUtil.debug("calc viewport ***** [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					if (parentH < viewportH) {
						viewportH = parentH;
						viewportW = ((pageOrigW * viewportH)/pageOrigH);
//						LogUtil.debug("calc viewport ***** resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
					}												
				}					
			} else {
				viewportW = parentW;
				viewportH = parentH;
				if (viewportW < pageOrigW) {
					viewportH = (viewportW/pageOrigW)*pageOrigH;
				}
				LogUtil.debug("calc viewport FTW [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");

			}		
		}	
		
		public function printViewedRegion():void {
	//		LogUtil.debug("Region [" + viewedRegionW + "," + viewedRegionH + "] [" + viewedRegionX + "," + viewedRegionY + "]");			
		}
			
		private function calcViewedRegionSize():void {
			if (fitToPage) {
				if (viewedRegionW != pageOrigW) {
					viewedRegionW = (viewportW/_calcPageW) * pageOrigW;
					if (viewedRegionW >= _calcPageW) {
						viewedRegionW = pageOrigW;
					}
				}
				
				if (viewedRegionH != pageOrigH) {
					viewedRegionH = (viewportH/_calcPageH) * pageOrigH;
					if (viewedRegionH >= _calcPageH) {
						viewedRegionH = pageOrigH;
					}
				}				
			} else {
				viewedRegionW = pageOrigW;
				viewedRegionH = (viewportH/viewportW) * pageOrigH;
				if (viewedRegionH >= pageOrigH) {
					viewedRegionH = pageOrigH;
				}
			}
		}
		
		public function onZoom(delta:int, mouseX:int, mouseY:int):void {
			if (fitToPage) {
				var cpw:int = _calcPageW;
				var cph:int = _calcPageH;
				var cpx:Number = _calcPageX/_calcPageW;
				var cpy:Number = _calcPageY/_calcPageH;
				LogUtil.debug("** Zooming [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + 
					_calcPageX + "," + _calcPageY + "][" + cpx + "," + cpy + "," + delta + "]");
				
				_calcPageW += delta*4;
				_calcPageH += delta*4;
				if ((_calcPageW < viewportW) || (_calcPageH < viewportH)) {
					_calcPageW = viewportW;
					_calcPageH = viewportH;
					_calcPageX = 0;
					_calcPageY = 0;
				} else {
					_calcPageX -= delta;
					_calcPageY -= delta;		
					LogUtil.debug("** Zooming 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + 
						_calcPageX + "," + _calcPageY + "][" + cpx + "," + cpy + "," + delta + "]");
				}
			} else {
				// For FTW, zooming isn't making the page bigger but actually scrolling.
				// -delta means scrolling down, +delta means scrolling up.
				onMove(0, delta*2);
			}
		}
		
		private function calcViewedX():void {
			viewedRegionX = Math.abs((pageOrigW/_calcPageW) * loaderX);
		}
		
		private function calcViewedY():void {
			viewedRegionY = Math.abs((pageOrigH/_calcPageH) * loaderY);
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
			
			if ((loaderH + newY) < viewportH) {
				LogUtil.debug("LoaderY is getting out of viewport [" + loaderH + "+(" + newY + ")[" + (loaderH+newY) + "]<" + viewportH + "=" + (viewportH - loaderH) + "]");				
				return (viewportH - loaderH);				
			}
			
			LogUtil.debug("LoaderY is good " + newY);
			return newY;
		}
		
		public function moveLoader(newX:int, newY:int):void {
			loaderX = newX;
			loaderY = newY;
		}

		public function displayPresenterRegion(x:int, y:int, width:int, height:int):void {
			loaderW = (viewportW*pageOrigW)/width;
			//			LogUtil.debug("calc loaderW [(" + viewportW + "*" + pageOrigW + ")/" + width + "=" + loaderW + "]");
			if (fitToPage) {
				loaderH = (viewportH*pageOrigH)/height;
//				LogUtil.debug("calc loaderH [(" + viewportH + "*" + pageOrigH + ")/" + height + "=" + loaderH + "]");
			} else {
				//loaderH = (viewportW/pageOrigW)*pageOrigH;
				loaderH = pageOrigH;
//				LogUtil.debug("FTW: calc loaderH [(" + viewportW + "/" + pageOrigW + ")*" + pageOrigH + "=" + loaderH + "]");
			}
			
//			LogUtil.debug("calc loaderH [(" + viewportW + "/" + pageOrigW + ")*" + pageOrigH + "=" + loaderH + "]");
			loaderX = (x*loaderW)/pageOrigW;
			//			LogUtil.debug("calc loaderX [(" + x + "*" + loaderW + ")/" + pageOrigW + "=" + loaderX + "]");
			loaderY = (y*loaderH)/pageOrigH;
			//			LogUtil.debug("calc loaderY [(" + y + "*" + loaderH + ")/" + pageOrigH + "=" + loaderY + "]");
			//			LogUtil.debug("Displaying [" + loaderW + "," + loaderH + "] [" + loaderX + "," + loaderY + "]");			
		}
		
		public function displayViewerRegion(x:int, y:int, width:int, height:int):void {
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

		public function saveViewedRegion(x:int, y:int, regionW:int, regionH:int):void {
			viewedRegionX = x;
			viewedRegionY = y;
			viewedRegionW = regionW;
			viewedRegionH = regionH;
		}
		
		public function calculateViewportNeededForRegion(x:int, y:int, regionW:int, regionH:int):void {			
			viewportH = parentH;
			viewportW = parentW;
			
			if (parentW < parentH) {
				viewportH = (regionH/regionW)*parentW;
				if (parentH < viewportH) {
					viewportH = parentH;
					viewportW = ((regionW * viewportH)/viewportH);
//					LogUtil.debug("calc viewport ***** resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
				}
			} else {
				viewportW = (regionW/regionH)*parentH;
				if (parentW < viewportW) {
					viewportW = parentW;
					viewportH = ((regionH * viewportW)/regionW);
//					LogUtil.debug("calc viewport resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
				}
			}
		}
		
	}
}