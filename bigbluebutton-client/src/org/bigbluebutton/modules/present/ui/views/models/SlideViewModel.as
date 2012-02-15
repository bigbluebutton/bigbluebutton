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
		
		private var _viewedRegionX:Number = 0;
		private var _viewedRegionY:Number = 0;
		private var _viewedRegionW:Number = 100;
		private var _viewedRegionH:Number = 100;
		
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
		
		public function reset(pageWidth:int, pageHeight:int):void {
			_calcPageW = _pageOrigW = pageWidth;
			_calcPageH = _pageOrigH = pageHeight;
		}

		public function resetForNewSlide(pageWidth:int, pageHeight:int):void {
			_calcPageW = _pageOrigW = pageWidth;
			_calcPageH = _pageOrigH = pageHeight;
			_calcPageX = 0;
			_calcPageY = 0;		
			_viewedRegionW = _viewedRegionH = 100;
			_viewedRegionX = _viewedRegionY = 0;
		}
		
		public function parentChange(parentW:int, parentH:int, fitToPage:Boolean):void {
			viewportW = this.parentW = parentW;
			viewportH = this.parentH = parentH;
			this.fitToPage = fitToPage;
		}
		
		private function calcViewedRegion():void {
			if (fitToPage) {
				_viewedRegionW = (viewportW/_calcPageW) * 100;
				_viewedRegionH = (viewportH/_calcPageH) * 100;
				
				if (_viewedRegionW > 100) _viewedRegionW = 100;
				if (_viewedRegionH > 100) _viewedRegionH = 100;
				
				LogUtil.debug("** calc vr ftp [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			} else {
				_viewedRegionW = 100;
				_viewedRegionH = (viewportH/_calcPageH) * 100;
				LogUtil.debug("** calc vr ftw [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			}
		}
		
		private function calcCalcPageSize():void {
			if (fitToPage) {
				_calcPageW = (viewportW/_viewedRegionW) * 100;
				_calcPageH = (viewportH/_viewedRegionH) * 100;
				LogUtil.debug("** calc cp ftp [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			} else {
				_calcPageW = viewportW;
				_calcPageH = (_calcPageW/_pageOrigW) * _pageOrigH;
				LogUtil.debug("** calc cp ftw [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			}
		}
		
		private function calcViewedRegionXY():void {
			if (fitToPage) {
				_viewedRegionX = (_calcPageX*100) / _calcPageW;
				_viewedRegionY = (_calcPageY*100) / _calcPageH;
			} else {
				_viewedRegionX = 0;
				_viewedRegionY = (_calcPageY*100) / _calcPageH;
			}
		}
		
		public function displayPresenterView():void {
			loaderX = _calcPageX;
			loaderY = _calcPageY;
			loaderW = _calcPageW;
			loaderH = _calcPageH;
		}
		
		public function adjustSlideAfterParentResized():void {
			if (fitToPage) {
				calculateViewportSize();
				calculateViewportXY();
				calcCalcPageSize();
				calcViewedRegion();
				calcViewedRegionXY();
				onResizeMove();				
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
				LogUtil.debug("** FTP resize 1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "]");
				
				if (_calcPageX >= 0) {
					_calcPageX = 0;
				} else if ((_calcPageW + _calcPageX*2) < viewportW) {
					_calcPageX = (viewportW - _calcPageW)/2;
					LogUtil.debug("** FTP resize 1.1");
				} else {
					//	_calcPageX = newX;
					LogUtil.debug("** FTP resize 1.2");
				}
				
				if (_calcPageY >= 0) {
					_calcPageY = 0;
				} else if ((_calcPageH + _calcPageY*2) < viewportH) {
					_calcPageY = (viewportH - _calcPageH)/2;
					LogUtil.debug("** FTP resize 1.3");
				} else {
					//			_calcPageY = newY;
					LogUtil.debug("** FTP resize 1.4");
				}
				
				//				LogUtil.debug("** FTP resize 2 [" + viewportW + "," + viewportH + "][" + _calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "]");				}
			} else {
				LogUtil.debug("** FTW resize 1 [" + viewportW + "," + viewportH + "][" + _calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				
				_calcPageX = 0;
				if (_calcPageY > 0 ) {
					_calcPageY = 0;
				} else if ((_calcPageH + _calcPageY*2) < viewportH) {
					// After lots of trial and error on why move doesn't work properly, I found I had to 
					// multiply the y by 2. Don't know why I need to double the delta to align the edges.
					_calcPageY = (viewportH - _calcPageH)/2;
					LogUtil.debug("** FTW resize 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				} else {
					LogUtil.debug("** FTW resize 2.5 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				}	
				
				LogUtil.debug("** FTW resize 3 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
			}
		}
		
		public function onMove(deltaX:int, deltaY:int):void {
			if (fitToPage) {
				var newX:int = _calcPageX + deltaX;	
				var newY:int = _calcPageY + deltaY;	
				
				LogUtil.debug("** FTP move 1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "][" + 
					newX + "," + newY + "][" + deltaX + "," + deltaY + "]");
				
				if (newX > 0) {
					_calcPageX = 0;
				} else if ((_calcPageW + newX*2) < viewportW) {
					// do nothing
					LogUtil.debug("** FTP move 1.1");
				} else {
					_calcPageX = newX;
					LogUtil.debug("** FTP move 1.2");
				}
				
				if (newY > 0) {
					_calcPageY = 0;
				} else if ((_calcPageH + newY*2) < viewportH) {
					// do nothing
					LogUtil.debug("** FTP move 1.3");
				} else {
					_calcPageY = newY;
					LogUtil.debug("** FTP move 1.4");
				}
				LogUtil.debug("** FTP move 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
			} else {				
				_calcPageX = 0
				LogUtil.debug("** FTW calcPageY [" + deltaX + "," + deltaY + "] [" + _calcPageY + "<" + viewportH + "]");									
				
				var newY:int = _calcPageY + deltaY;				
				if (newY > 0) _calcPageY = 0;
				else if ((_calcPageH + newY*2) < viewportH) {
					// do nothing
					LogUtil.debug("** FTW move 1.1");
					//				LogUtil.debug("calcPageY [" + _calcPageH + "," + _calcPageY + "] [" + (_calcPageH + _calcPageY) + "<" + viewportH + "] [" + _calcPageY + "]");						
				} else {
					_calcPageY = newY;
					LogUtil.debug("** FTP move 1.2");
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
				LogUtil.debug("calc viewport FTW [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
			}		
		}	
		
		public function calculateViewportXY():void {
			if (viewportW == parentW) {
				viewportX = 0;
			} else {
				viewportX = (parentW - viewportW)/2;
			}
			
			if (viewportH == parentH) {
				viewportY = 0;
			} else {
				viewportY = (parentH - viewportH)/2;
			}
			LogUtil.debug("calc viewport xy [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + viewportX + "," + viewportY + "]");
		}
		
		public function printViewedRegion():void {
			LogUtil.debug("Region [" + viewedRegionW + "," + viewedRegionH + "] [" + viewedRegionX + "," + viewedRegionY + "]");			
		}
		
		public function onZoom(delta:int, vpx:int, vpy:int, mouseX:int, mouseY:int):void {
			if (fitToPage) {
				var cpw:int = _calcPageW;
				var cph:int = _calcPageH;
				var zpx:int = Math.abs(_calcPageX) + mouseX;
				var zpy:int = Math.abs(_calcPageY) + mouseY;
				var zpxp:Number = zpx/cpw;
				var zpyp:Number = zpy/cph;
				
				LogUtil.debug("** Zoompoint [" + viewportW + "," + viewportH + "][" + mouseX + "," + mouseY + "][" + _calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "][" + vpx + "," + vpy + "," + zpx + "," + zpy + "] ");			
				
				if (delta < 0) _calcPageW *= 0.95
				else _calcPageW *= 1.05
				_calcPageH = (_calcPageW/cpw) * cph; 
				
				var zpx1:int = _calcPageW * zpxp;
				var zpy1:int = _calcPageH * zpyp;				
				_calcPageX = -((zpx1 + zpx)/2) + mouseX;
				_calcPageY = -((zpy1 + zpy)/2) + mouseY;
				
				LogUtil.debug("** Zoom 1 [" + viewportW + "," + viewportH + "][" + mouseX + "," + mouseY + "][" + _calcPageW + "," + _calcPageH + "," + _calcPageX + "," + _calcPageY + "][" + zpx1 + "," + zpy1 + "] ");				
				
				if (_calcPageX > 0) {
					_calcPageX = 0;
					LogUtil.debug("** Zoom 1.1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
				} else {
					if (_calcPageX*2 + _calcPageW < viewportW) {
						_calcPageX = (viewportW - _calcPageW)/2;
						LogUtil.debug("** Zoom 1.2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
					}					
				}
				
				if (_calcPageY > 0) {
					_calcPageY = 0;		
					LogUtil.debug("** Zoom 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
				} else {
					if (_calcPageY*2 + _calcPageH < viewportH) {
						_calcPageY = (viewportH - _calcPageH)/2;
						LogUtil.debug("** Zoom 3 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
					}					
				}
				
				if ((_calcPageW < viewportW) || (_calcPageH < viewportH)) {
					_calcPageW = viewportW;
					_calcPageH = viewportH;
					_calcPageX = 0;
					_calcPageY = 0;
					LogUtil.debug("** Zoom 4 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				} 
				LogUtil.debug("** Zoom 5 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
			} else {
				// For FTW, zooming isn't making the page bigger but actually scrolling.
				// -delta means scrolling down, +delta means scrolling up.
				onMove(0, delta*2);
			}
			
			calcViewedRegion();
			calcViewedRegionXY();
		}
		
		public function displayViewerRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {
			LogUtil.debug("** disp viewer 1 [" + regionW + "," + regionH + "][" + x + "," + y + "]");
			_calcPageW = viewportW/(regionW/100);
			_calcPageH = viewportH/(regionH/100);
			_calcPageX = (x/100) * _calcPageW;
			_calcPageY =  (y/100) * _calcPageH;					
			LogUtil.debug("** disp viewer 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
		}
		
		public function saveViewedRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {
			_viewedRegionX = x;
			_viewedRegionY = y;
			_viewedRegionW = regionW;
			_viewedRegionH = regionH;
		}
		
		public function calculateViewportNeededForRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {			
			var vrwp:int = pageOrigW * (regionW/100);
			var vrhp:int = pageOrigH * (regionH/100);
			
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