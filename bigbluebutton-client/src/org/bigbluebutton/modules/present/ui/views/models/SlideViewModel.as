package org.bigbluebutton.modules.present.ui.views.models
{
	import org.bigbluebutton.common.LogUtil;

	[Bindable]
	public class SlideViewModel
	{
		public static const MAX_ZOOM_PERCENT:Number = 400;
		public static const HUNDRED_PERCENT:Number = 100;
		
		public var viewportX:Number = 0;
		public var viewportY:Number = 0;
		public var viewportW:Number = 0;
		public var viewportH:Number = 0;
		
		private var _viewedRegionX:Number = 0;
		private var _viewedRegionY:Number = 0;
		private var _viewedRegionW:Number = HUNDRED_PERCENT;
		private var _viewedRegionH:Number = HUNDRED_PERCENT;
		
		private var _pageOrigW:Number = 0;
		private var _pageOrigH:Number = 0;
		private var _calcPageW:Number = 0;
		private var _calcPageH:Number = 0;
		private var _calcPageX:Number = 0;
		private var _calcPageY:Number = 0;
		private var _parentW:Number = 0;
		private var _parentH:Number = 0;
		
		public var loaderW:Number = 0;
		public var loaderH:Number = 0;
		public var loaderX:Number = 0;
		public var loaderY:Number = 0;
		

		
		public var fitToPage:Boolean = true;
		public var hasPageLoaded:Boolean = false;
		
		// After lots of trial and error on why synching doesn't work properly, I found I had to 
		// multiply the coordinates by 2. There's something I don't understand probably on the
		// canvas coordinate system. (ralam feb 22, 2012)
		private const MYSTERY_NUM:int = 2;
		
		public function set parentW(width:Number):void {
			_parentW = width;
		}
		
		public function set parentH(height:Number):void {
			_parentH = height;
		}
		
		public function get parentW():Number {
			return _parentW;
		}
		
		public function get parentH():Number {
			return _parentH;
		}
		
		public function get pageOrigW():Number {
			return _pageOrigW;
		}
		
		public function get pageOrigH():Number {
			return _pageOrigH;
		}
		
		public function get viewedRegionW():Number {
			return _viewedRegionW;
		}
		
		public function get viewedRegionH():Number {
			return _viewedRegionH;
		}
		
		public function get viewedRegionX():Number {
			return _viewedRegionX;
		}
		
		public function get viewedRegionY():Number {
			return _viewedRegionY;
		}
		
		public function reset(pageWidth:Number, pageHeight:Number):void {
			_calcPageW = _pageOrigW = pageWidth;
			_calcPageH = _pageOrigH = pageHeight;
		}

		public function resetForNewSlide(pageWidth:Number, pageHeight:Number):void {
			_calcPageW = _pageOrigW = pageWidth;
			_calcPageH = _pageOrigH = pageHeight;
			_calcPageX = 0;
			_calcPageY = 0;		
			_viewedRegionW = _viewedRegionH = HUNDRED_PERCENT;
			_viewedRegionX = _viewedRegionY = 0;
		}
		
		public function parentChange(parentW:Number, parentH:Number, fitToPage:Boolean):void {
			viewportW = this.parentW = parentW;
			viewportH = this.parentH = parentH;
			this.fitToPage = fitToPage;
		}
		
		private function calcViewedRegion():void {
			if (fitToPage) {
				_viewedRegionW = (viewportW/_calcPageW) * HUNDRED_PERCENT;
				_viewedRegionH = (viewportH/_calcPageH) * HUNDRED_PERCENT;
				
				if (_viewedRegionW > HUNDRED_PERCENT) _viewedRegionW = HUNDRED_PERCENT;
				if (_viewedRegionH > HUNDRED_PERCENT) _viewedRegionH = HUNDRED_PERCENT;
				
//				LogUtil.debug("** calc vr ftp [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			} else {
				_viewedRegionW = HUNDRED_PERCENT;
				_viewedRegionH = (viewportH/_calcPageH) * HUNDRED_PERCENT;
//				LogUtil.debug("** calc vr ftw [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			}
		}
		
		private function calcCalcPageSize():void {
			if (fitToPage) {
				_calcPageW = (viewportW/_viewedRegionW) * HUNDRED_PERCENT;
				_calcPageH = (viewportH/_viewedRegionH) * HUNDRED_PERCENT;
//				LogUtil.debug("** calc cp ftp [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			} else {
				_calcPageW = viewportW;
				_calcPageH = (_calcPageW/_pageOrigW) * _pageOrigH;
//				LogUtil.debug("** calc cp ftw [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			}
		}
		
		private function calcViewedRegionXY():void {
			if (fitToPage) {
				_viewedRegionX = (_calcPageX * HUNDRED_PERCENT) / _calcPageW;
				_viewedRegionY = (_calcPageY * HUNDRED_PERCENT) / _calcPageH;
			} else {
				_viewedRegionX = 0;
				_viewedRegionY = (_calcPageY * HUNDRED_PERCENT) / _calcPageH;
			}
		}
		
		public function displayPresenterView():void {
			loaderX = Math.round(_calcPageX);
			loaderY = Math.round(_calcPageY);
			loaderW = Math.round(_calcPageW);
			loaderH = Math.round(_calcPageH);
		}
		
		public function adjustSlideAfterParentResized():void {
			if (fitToPage) {
				calculateViewportNeededForRegion(_viewedRegionX, _viewedRegionY, _viewedRegionW, _viewedRegionH);
				displayViewerRegion(_viewedRegionX, _viewedRegionY, _viewedRegionW, _viewedRegionH);
				calculateViewportXY();
				displayPresenterView();
				printViewedRegion();
			} else {
				calculateViewportSize();
				calculateViewportXY();
				calcCalcPageSize();
				calcViewedRegion();
				calcViewedRegionXY();
				onResizeMove();				
			}			
		}
		
		private function onResizeMove():void {
			if (fitToPage) {			
				/** Bounds detection **/
				if (_calcPageX >= 0) {
					// Don't let the left edge move inside the view.
					_calcPageX = 0;
				} else if ((_calcPageW + _calcPageX * MYSTERY_NUM) < viewportW) {
					// Don't let the right edge move inside the view.
					_calcPageX = (viewportW - _calcPageW) / MYSTERY_NUM;
				} else {
					// Let the move happen.
				}
				
				if (_calcPageY >= 0) {
					// Don't let the top edge move into the view.
					_calcPageY = 0;
				} else if ((_calcPageH + _calcPageY * MYSTERY_NUM) < viewportH) {
					// Don't let the bottome edge move into the view.
					_calcPageY = (viewportH - _calcPageH) / MYSTERY_NUM;
				} else {
					// Let the move happen.
				}
			} else {
				/** Bounds detection **/				
				// The left edge should alway align the view.
				_calcPageX = 0;
				
				if (_calcPageY > 0 ) {
					// Don't let the top edge into the view.
					_calcPageY = 0;
				} else if ((_calcPageH + _calcPageY * MYSTERY_NUM) < viewportH) {
					// Don't let the bottome edge into the view.
					_calcPageY = (viewportH - _calcPageH) / MYSTERY_NUM;
				} else {
					// Let the move happen.
				}	
			}
		}
		
		public function onMove(deltaX:Number, deltaY:Number):void {
			if (fitToPage) {
				var newX:Number = _calcPageX + deltaX;	
				var newY:Number = _calcPageY + deltaY;	
				
//				LogUtil.debug("** FTP move 1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "][" + 
//					newX + "," + newY + "][" + deltaX + "," + deltaY + "]");
				
				if (newX > 0) {
					_calcPageX = 0;
				} else if ((_calcPageW + newX * MYSTERY_NUM) < viewportW) {
					// do nothing
//					LogUtil.debug("** FTP move 1.1");
				} else {
					_calcPageX = newX;
//					LogUtil.debug("** FTP move 1.2");
				}
				
				if (newY > 0) {
					_calcPageY = 0;
				} else if ((_calcPageH + newY * MYSTERY_NUM) < viewportH) {
					// do nothing
//					LogUtil.debug("** FTP move 1.3");
				} else {
					_calcPageY = newY;
//					LogUtil.debug("** FTP move 1.4");
				}
//				LogUtil.debug("** FTP move 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
			} else {				
				_calcPageX = 0
//				LogUtil.debug("** FTW calcPageY [" + deltaX + "," + deltaY + "] [" + _calcPageY + "<" + viewportH + "]");									
				
				var newY:Number = _calcPageY + deltaY;				
				if (newY > 0) _calcPageY = 0;
				else if ((_calcPageH + newY * MYSTERY_NUM) < viewportH) {
					// do nothing
//					LogUtil.debug("** FTW move 1.1");
					//				LogUtil.debug("calcPageY [" + _calcPageH + "," + _calcPageY + "] [" + (_calcPageH + _calcPageY) + "<" + viewportH + "] [" + _calcPageY + "]");						
				} else {
					_calcPageY = newY;
//					LogUtil.debug("** FTP move 1.2");
				}
			}	
			
			calcViewedRegion();
			calcViewedRegionXY();
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
//				LogUtil.debug("calc viewport FTW [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
			}		
		}	
		
		public function calculateViewportXY():void {
			if (viewportW == parentW) {
				viewportX = 0;
			} else {
				viewportX = (parentW - viewportW) / MYSTERY_NUM;
			}
			
			if (viewportH == parentH) {
				viewportY = 0;
			} else {
				viewportY = (parentH - viewportH) / MYSTERY_NUM;
			}
//			LogUtil.debug("calc viewport xy [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + viewportX + "," + viewportY + "]");
		}
		
		public function printViewedRegion():void {
			LogUtil.debug("Region [" + viewedRegionW + "," + viewedRegionH + "] [" + viewedRegionX + "," + viewedRegionY + "]");			
			LogUtil.debug("Region [" + ((viewedRegionW / HUNDRED_PERCENT)*_calcPageW) + "," + ((viewedRegionH/HUNDRED_PERCENT)*_calcPageH) + 
				"] [" + ((viewedRegionX/HUNDRED_PERCENT)*_calcPageW) + "," + ((viewedRegionY/HUNDRED_PERCENT)*_calcPageH) + "]");
		}
		
		public function onZoom(zoomValue:Number, mouseX:Number, mouseY:Number):void {
			if (fitToPage) {
				var cpw:Number = _calcPageW;
				var cph:Number = _calcPageH;
				var zpx:Number = Math.abs(_calcPageX) + mouseX;
				var zpy:Number = Math.abs(_calcPageY) + mouseY;
				var zpxp:Number = zpx/cpw;
				var zpyp:Number = zpy/cph;
				
//				LogUtil.debug("** Zoompoint [" + viewportW + "," + viewportH + "][" + mouseX + "," + mouseY + "][" + _calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "][" + vpx + "," + vpy + "," + zpx + "," + zpy + "] ");			
				
				_calcPageW = pageOrigW * zoomValue / HUNDRED_PERCENT;
				_calcPageH = (_calcPageW/cpw) * cph; 
				
				var zpx1:Number = _calcPageW * zpxp;
				var zpy1:Number = _calcPageH * zpyp;				
				_calcPageX = -((zpx1 + zpx)/2) + mouseX;
				_calcPageY = -((zpy1 + zpy)/2) + mouseY;
				
//				LogUtil.debug("** Zoom 1 [" + viewportW + "," + viewportH + "][" + mouseX + "," + mouseY + "][" + _calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "][" + zpx1 + "," + zpy1 + "] ");				
				
				if (_calcPageX > 0) {
					_calcPageX = 0;
//					LogUtil.debug("** Zoom 1.1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
				} else {
					if (_calcPageX * MYSTERY_NUM + _calcPageW < viewportW) {
						_calcPageX = (viewportW - _calcPageW) / MYSTERY_NUM;
//						LogUtil.debug("** Zoom 1.2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
					}					
				}
				
				if (_calcPageY > 0) {
					_calcPageY = 0;		
//					LogUtil.debug("** Zoom 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
				} else {
					if (_calcPageY * MYSTERY_NUM + _calcPageH < viewportH) {
						_calcPageY = (viewportH - _calcPageH) / MYSTERY_NUM;
//						LogUtil.debug("** Zoom 3 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
					}					
				}
				
				if ((_calcPageW < viewportW) || (_calcPageH < viewportH)) {
					_calcPageW = viewportW;
					_calcPageH = viewportH;
					_calcPageX = 0;
					_calcPageY = 0;
//					LogUtil.debug("** Zoom 4 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				} 
//				LogUtil.debug("** Zoom 5 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
			} else {
				// For FTW, zooming isn't making the page bigger but actually scrolling.
				// -delta means scrolling down, +delta means scrolling up.
				//onMove(0, delta*2);
				_calcPageX = 0;
				_calcPageY = (zoomValue/MAX_ZOOM_PERCENT) * _calcPageH - (HUNDRED_PERCENT/MAX_ZOOM_PERCENT) * _calcPageH;
			}
			
			calcViewedRegion();
			calcViewedRegionXY();
		}
		
		public function displayViewerRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {
			LogUtil.debug("** disp viewer 1 [" + regionW + "," + regionH + "][" + x + "," + y + "]");
			_calcPageW = viewportW/(regionW/HUNDRED_PERCENT);
			_calcPageH = viewportH/(regionH/HUNDRED_PERCENT);
			_calcPageX = (x/HUNDRED_PERCENT) * _calcPageW;
			_calcPageY =  (y/HUNDRED_PERCENT) * _calcPageH;					
			LogUtil.debug("** disp viewer 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
		}
		
		public function saveViewedRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {
			_viewedRegionX = x;
			_viewedRegionY = y;
			_viewedRegionW = regionW;
			_viewedRegionH = regionH;
		}
		
		public function calculateViewportNeededForRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {			
			var vrwp:Number = pageOrigW * (regionW/HUNDRED_PERCENT);
			var vrhp:Number = pageOrigH * (regionH/HUNDRED_PERCENT);
			
			if (parentW < parentH) {
				viewportW = parentW;
				viewportH = (vrhp/vrwp)*parentW;				 
				if (parentH < viewportH) {
					viewportH = parentH;
					viewportW = ((vrwp * viewportH)/viewportH);
					LogUtil.debug("calc viewport ***** resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
				}
			} else {
				viewportH = parentH;
				viewportW = (vrwp/vrhp)*parentH;
				if (parentW < viewportW) {
					viewportW = parentW;
					viewportH = ((vrhp * viewportW)/vrwp);
					LogUtil.debug("calc viewport resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
				}
			}
		}
	}
}