package org.bigbluebutton.air.presentation.models {
	import org.bigbluebutton.air.presentation.utils.SlideCalcUtil;
	
	public class SlideModel {
		public static const MYSTERY_NUM:Number = 2;
		
		public static const MAX_ZOOM_PERCENT:Number = 400;
		
		public static const HUNDRED_PERCENT:Number = 100;
		
		public var viewportX:Number = 0;
		
		public var viewportY:Number = 0;
		
		public var viewportW:Number = 0;
		
		public var viewportH:Number = 0;
		
		public var loaderW:Number = 0;
		
		public var loaderH:Number = 0;
		
		public var loaderX:Number = 0;
		
		public var loaderY:Number = 0;
		
		private var _pageOrigW:Number = 0;
		
		private var _pageOrigH:Number = 0;
		
		private var _calcPageW:Number = 0;
		
		private var _calcPageH:Number = 0;
		
		private var _calcPageX:Number = 0;
		
		private var _calcPageY:Number = 0;
		
		private var _parentW:Number = 0;
		
		private var _parentH:Number = 0;
		
		public function SlideModel() {
		}
		
		public function resetForNewSlide(pageWidth:Number, pageHeight:Number):void {
			_pageOrigW = pageWidth;
			_pageOrigH = pageHeight;
		}
		
		public function parentChange(parentW:Number, parentH:Number):void {
			viewportW = _parentW = parentW;
			viewportH = _parentH = parentH;
		}
		
		public function calculateViewportNeededForRegion(regionW:Number, regionH:Number):void {
			var vrwp:Number = _pageOrigW * (regionW / HUNDRED_PERCENT);
			var vrhp:Number = _pageOrigH * (regionH / HUNDRED_PERCENT);
			
			if (_parentW < _parentH) {
				viewportW = _parentW;
				viewportH = (vrhp / vrwp) * _parentW;
				if (_parentH < viewportH) {
					viewportH = _parentH;
					viewportW = ((vrwp * viewportH) / vrhp);
				}
			} else {
				viewportH = _parentH;
				viewportW = (vrwp / vrhp) * _parentH;
				if (_parentW < viewportW) {
					viewportW = _parentW;
					viewportH = ((vrhp * viewportW) / vrwp);
				}
			}
		}
		
		public function displayViewerRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {
			_calcPageW = viewportW / (regionW / HUNDRED_PERCENT);
			_calcPageH = viewportH / (regionH / HUNDRED_PERCENT);
			_calcPageX = (x / HUNDRED_PERCENT) * _calcPageW * MYSTERY_NUM;
			_calcPageY = (y / HUNDRED_PERCENT) * _calcPageH * MYSTERY_NUM;
		
		/**
		 * I have no idea why I need to multiply the x and y percentages by 2, but I
		 * do. I think it is a bug in 0.81, but I can't change that.
		 *     - capilkey March 11, 2015
		 */
		}
		
		public function calculateViewportXY():void {
			viewportX = SlideCalcUtil.calculateViewportX(viewportW, _parentW);
			viewportY = SlideCalcUtil.calculateViewportY(viewportH, _parentH);
		}
		
		public function displayPresenterView():void {
			loaderX = Math.round(_calcPageX);
			loaderY = Math.round(_calcPageY);
			loaderW = Math.round(_calcPageW);
			loaderH = Math.round(_calcPageH);
		}
	}
}
