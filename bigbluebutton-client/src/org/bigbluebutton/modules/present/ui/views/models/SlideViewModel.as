/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.present.ui.views.models
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;

	public class SlideViewModel
	{
		private static const LOGGER:ILogger = getClassLogger(SlideViewModel);

		public static const MAX_ZOOM_PERCENT:Number = 400;
		public static const HUNDRED_PERCENT:Number = 100;
		
		[Bindable] public var viewportX:Number = 0;
		[Bindable] public var viewportY:Number = 0;
		[Bindable] public var viewportW:Number = 0;
		[Bindable] public var viewportH:Number = 0;
		
		[Bindable] public var loaderW:Number = 0;
		[Bindable] public var loaderH:Number = 0;
		[Bindable] public var loaderX:Number = 0;
		[Bindable] public var loaderY:Number = 0;
		
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

		private var fitToPage:Boolean = true;
		
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
		
		private function isPortraitDoc():Boolean {
			return _pageOrigH > _pageOrigW;
		}
		
		public function reset(pageWidth:Number, pageHeight:Number):void {
			_pageOrigW = pageWidth;
			_pageOrigH = pageHeight;
		}

		public function resetForNewSlide(pageWidth:Number, pageHeight:Number):void {
			_pageOrigW = pageWidth;
			_pageOrigH = pageHeight;
		}
		
		public function parentChange(parentW:Number, parentH:Number):void {
			viewportW = this.parentW = parentW;
			viewportH = this.parentH = parentH;
		}
		
		public function calculateViewportXY():void {
			viewportX = SlideCalcUtil.calculateViewportX(viewportW, parentW);
			viewportY = SlideCalcUtil.calculateViewportY(viewportH, parentH);			
	    }
	
		private function calcViewedRegion():void {
			_viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(viewportW, _calcPageW);
			_viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(viewportH, _calcPageH);
			_viewedRegionX = SlideCalcUtil.calcViewedRegionX(_calcPageX, _calcPageW);
			_viewedRegionY = SlideCalcUtil.calcViewedRegionY(_calcPageY, _calcPageH);
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
				_calcPageW = (viewportW/_viewedRegionW) * HUNDRED_PERCENT;
				_calcPageH = (_pageOrigH/_pageOrigW) * _calcPageW;
				calcViewedRegion();
				onResizeMove();				
			}
		}
		
		public function switchToFitToPage(ftp:Boolean):void {
			LOGGER.debug("switchToFitToPage");
			
			this.fitToPage = ftp;
			calculateViewportSize();
			calculateViewportXY();			
		}
		
		private function doWidthBoundsDetection():void {
			if (_calcPageX >= 0) {
				// Don't let the left edge move inside the view.
				_calcPageX = 0;
			} else if ((_calcPageW + _calcPageX * MYSTERY_NUM) < viewportW) {
				// Don't let the right edge move inside the view.
				_calcPageX = (viewportW - _calcPageW) / MYSTERY_NUM;
			} else {
				// Let the move happen.
			}			
		}
		
		private function doHeightBoundsDetection():void {
			if (_calcPageY >= 0) {
				// Don't let the top edge move into the view.
				_calcPageY = 0;
			} else if ((_calcPageH + _calcPageY * MYSTERY_NUM) < viewportH) {
				// Don't let the bottome edge move into the view.
				_calcPageY = (viewportH - _calcPageH) / MYSTERY_NUM;
			} else {
				// Let the move happen.
			}			
		}
		
		private function onResizeMove():void {		
			doWidthBoundsDetection();
			doHeightBoundsDetection();
		}
		
		public function onMove(deltaX:Number, deltaY:Number):void {
			_calcPageX += deltaX / MYSTERY_NUM;
			_calcPageY += deltaY / MYSTERY_NUM;
			
			onResizeMove();	
			calcViewedRegion();
		}
		
		public function calculateViewportSize():void {
			viewportW = parentW;
			viewportH = parentH;
			
			if (fitToPage) {
				// If the height is smaller than the width, we use the height as the base to determine the size of the slide.
				if (parentH < parentW) {					
					viewportH = parentH;
					viewportW = ((pageOrigW * viewportH)/pageOrigH);					
					if (parentW < viewportW) {
						viewportW = parentW;
						viewportH = ((pageOrigH * viewportW)/pageOrigW);
					}
				} else {
					viewportW = parentW;
					viewportH = (viewportW/pageOrigW) * pageOrigH;
					if (parentH < viewportH) {
						viewportH = parentH;
						viewportW = ((pageOrigW * viewportH)/pageOrigH);
					}												
				}					
			} else {
				viewportH = (viewportW/pageOrigW)*pageOrigH;
				if (viewportH > parentH) 
					viewportH = parentH;
			}		
		}	
			
		public function printViewedRegion():void {
//			LogUtil.debug("Region [" + viewedRegionW + "," + viewedRegionH + "] [" + viewedRegionX + "," + viewedRegionY + "]");			
//			LogUtil.debug("Region [" + ((viewedRegionW / HUNDRED_PERCENT)*_calcPageW) + "," + ((viewedRegionH/HUNDRED_PERCENT)*_calcPageH) + 
//				"] [" + ((viewedRegionX/HUNDRED_PERCENT)*_calcPageW) + "," + ((viewedRegionY/HUNDRED_PERCENT)*_calcPageH) + "]");
		}
		
		public function onZoom(zoomValue:Number, mouseX:Number, mouseY:Number):void {
			
			// Absolute x and y positions of the mouse over the (enlarged) slide:
			var absXcoordInPage:Number = Math.abs(_calcPageX) * MYSTERY_NUM + mouseX;
			var absYcoordInPage:Number = Math.abs(_calcPageY) * MYSTERY_NUM + mouseY;
			
			// Relative position of mouse over the slide. For example, if your slide is 1000 pixels wide, 
			// and your mouse has an absolute x-coordinate of 700, then relXcoordInPage will be 0.7 :
			var relXcoordInPage:Number = absXcoordInPage / _calcPageW; 
			var relYcoordInPage:Number = absYcoordInPage / _calcPageH;
			
			// Relative position of mouse in the view port (same as above, but with the view port):
			var relXcoordInViewport:Number = mouseX / viewportW;
			var relYcoordInViewport:Number = mouseY / viewportH;
			
			if (isPortraitDoc()) {
				if (fitToPage) {
					_calcPageH = viewportH * zoomValue / HUNDRED_PERCENT;
					_calcPageW = (_pageOrigW/_pageOrigH)*_calcPageH;
				} else {
					_calcPageW = viewportW * zoomValue / HUNDRED_PERCENT;
					_calcPageH = (_calcPageW/_pageOrigW)*_pageOrigH;
				}
			} else {
				if (fitToPage) {
					_calcPageW = viewportW * zoomValue / HUNDRED_PERCENT;
					_calcPageH = viewportH * zoomValue / HUNDRED_PERCENT;
				} else {
					_calcPageW = viewportW * zoomValue / HUNDRED_PERCENT;
					_calcPageH = (_calcPageW/_pageOrigW)*_pageOrigH;
				}
			}
			
			absXcoordInPage = relXcoordInPage * _calcPageW;
			absYcoordInPage = relYcoordInPage * _calcPageH;
			
			_calcPageX = -((absXcoordInPage - mouseX) / MYSTERY_NUM);
			_calcPageY = -((absYcoordInPage - mouseY) / MYSTERY_NUM);
			
			doWidthBoundsDetection();
			doHeightBoundsDetection();
			
			calcViewedRegion();
		}
		
		public function displayViewerRegion(x:Number, y:Number, regionW:Number, regionH:Number):void {
//			LogUtil.debug("** disp viewer 1 [" + regionW + "," + regionH + "][" + x + "," + y + "]");
			_calcPageW = viewportW/(regionW/HUNDRED_PERCENT);
			_calcPageH = viewportH/(regionH/HUNDRED_PERCENT);
			_calcPageX = (x/HUNDRED_PERCENT) * _calcPageW;
			_calcPageY =  (y/HUNDRED_PERCENT) * _calcPageH;					
//			LogUtil.debug("** disp viewer 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
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
					viewportW = ((vrwp * viewportH)/vrhp);
//					LogUtil.debug("calc viewport ***** resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
				}
			} else {
				viewportH = parentH;
				viewportW = (vrwp/vrhp)*parentH;
				if (parentW < viewportW) {
					viewportW = parentW;
					viewportH = ((vrhp * viewportW)/vrwp);
//					LogUtil.debug("calc viewport resizing [" + viewportW + "," + viewportH + "] [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
				}
			}
		}
	}
}