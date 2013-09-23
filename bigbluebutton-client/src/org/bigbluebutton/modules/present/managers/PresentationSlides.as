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
package org.bigbluebutton.modules.present.managers
{
	import mx.collections.ArrayCollection;
	
	public class PresentationSlides
	{
		private var _slides:ArrayCollection = new ArrayCollection();
		private var _selected:int;
		
		public function PresentationSlides()
		{
		}

		public function get slides():ArrayCollection {
			return _slides;
		}
		
		public function get selected():int {
			return _selected;
		}
		
		public function set selected(num:int):void {
			_selected = num;
		}
		
		public function getSlideAt(num:int):Slide {
			return _slides.getItemAt(num) as Slide;
		}
		
		public function clear():void {
			_slides.removeAll();
		}
		
		public function add(slide:Slide):void {
			//LogUtil.debug('Adding slide ' + slide);
			_slides.addItem(slide);
		}
		
		public function size():int {
			return _slides.length;
		}
	}
}