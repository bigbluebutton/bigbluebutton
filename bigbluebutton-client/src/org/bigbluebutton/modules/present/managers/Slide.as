/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.present.managers
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.common.LogUtil;
	
	[Bindable]
	public class Slide
	{
		private var _loader:URLLoader;
		private var _loaded:Boolean = false;
		private var _slideUri:String;
		private var _slideHandler:Function;
		private var _slideNum:Number;
		private var _thumbUri:String;
		
		public var viewportX:int = 0;
		public var viewportY:int = 0;
		public var viewportW:int = 0;
		public var viewportH:int = 0;
		
		private var _viewedRegionX:int = 0;
		private var _viewedRegionY:int = 0;
		private var _viewedRegionW:int = 0;
		private var _viewedRegionH:int = 0;
		
		private var _pageOrigW:int = 0;
		private var _pageOrigH:int = 0;
		private var _calcPageW:int = 0;
		private var _calcPageH:int = 0;
		private var _calcPageX:int = 0;
		private var _calcPageY:int = 0;
		
		private var _zoom:Number = 1;
		
		private var _parentW:int = 0;
		private var _parentH:int = 0;
		
		public var loaderW:int = 0;
		public var loaderH:int = 0;
		public var loaderX:int = 0;
		public var loaderY:int = 0;
		
		public var fitToPage:Boolean = true;
		public var hasPageLoaded:Boolean = false;
				
		public function Slide(slideNum:Number, slideUri:String, thumbUri:String)
		{
			_slideNum = slideNum;
			_slideUri = slideUri;
			_thumbUri = thumbUri;
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, handleComplete);	
			_loader.dataFormat = URLLoaderDataFormat.BINARY;		
		}

		public function load(slideLoadedHandler:Function):void {
			if (_loaded) {
				slideLoadedHandler(_slideNum, _loader.data);
			} else {
				_slideHandler = slideLoadedHandler;
				_loader.load(new URLRequest(_slideUri));
			}
		}
		
		private function handleComplete(e:Event):void{
			_loaded = true;
			if (_slideHandler != null) {
				_slideHandler(_slideNum, _loader.data);
			}		
		}
		
		public function get thumb():String {
			return _thumbUri;
		}
		
		public function get slideNumber():Number {
			return _slideNum;
		}
		

		
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
			_pageOrigW = pageWidth;
			_pageOrigH = pageHeight;
			_viewedRegionW = 100;
			_viewedRegionH = 100;
			loaderH = _pageOrigH;
			loaderW = _pageOrigW;
			loaderX = 0;
			loaderY = 0;		
			_zoom = 1;	
		}
		
		public function parentChange(parentW:int, parentH:int, fitToPage:Boolean):void {
			viewportW = this.parentW = parentW;
			viewportH = this.parentH = parentH;
			this.fitToPage = fitToPage;
		}
		
		public function calcViewedRegion():void {
			if (fitToPage) {
				_viewedRegionW = (viewportW/_calcPageW) * 100;
				_viewedRegionH = (viewportH/_calcPageH) * 100;
				LogUtil.debug("** calc vr ftp [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			} else {
				_viewedRegionW = 100;
				_viewedRegionH = (viewportH/_calcPageH) * 100;
				LogUtil.debug("** calc vr ftw [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _viewedRegionW + "," + _viewedRegionH + "]");				
			}
		}
		
		public function calcCalcPageSize():void {
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
		
		public function calcViewedRegionXY():void {
			if (fitToPage) {
				_viewedRegionX = (_calcPageW/_pageOrigW) * _calcPageX;
				_viewedRegionY = (_calcPageH/_pageOrigH) * _calcPageY;
			} else {
				_viewedRegionX = 0;
				_viewedRegionY = (_calcPageH/_pageOrigH) * _calcPageY;
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
				if (_calcPageX > 0 || _calcPageY > 0) {
					if (_calcPageX > 0) _calcPageX = 0				
					if (_calcPageY > 0) _calcPageY = 0		
					LogUtil.debug("** FTP resize 1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");				
				} else {
					if (_calcPageY + _calcPageH < viewportH) {
						_calcPageY = (viewportH - _calcPageH);
					}
					if (_calcPageX + _calcPageW < viewportW) {
						_calcPageX = (viewportW - _calcPageW);
					}					
					LogUtil.debug("** FTP resize 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				}
			} else {
				LogUtil.debug("** FTW resize 1 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");

				_calcPageX = 0;
				if (_calcPageY >= 0 ) {
					_calcPageY = 0;
				} else if ((_calcPageH + _calcPageY*2) < viewportH) {
					// After lots of trial and error on why move doesn't work properly, I found I had to 
					// multiply the y by 2. Don't know why I need to double the delta to align the edges.
					_calcPageY = (viewportH - _calcPageH)/2;
					LogUtil.debug("** FTW resize 2 [" + viewportW + "," + viewportH + "][" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
				} else {
		//			_calcPageY = (viewportH - _calcPageH)/2;
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
			_viewedRegionX = x;
			_viewedRegionY = y;
			_viewedRegionW = regionW;
			_viewedRegionH = regionH;
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