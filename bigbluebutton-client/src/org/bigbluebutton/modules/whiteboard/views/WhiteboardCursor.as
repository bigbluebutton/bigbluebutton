/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.modules.whiteboard.views {
	import flash.display.Shape;
	
	public class WhiteboardCursor extends Shape {
		private static const PRESENTER_COLOR:uint = 0xFF0000;
		private static const OTHER_COLOR:uint = 0x00FF00;
		
		private var _userId:String;
		private var _origX:Number;
		private var _origY:Number;
		private var _parentWidth:Number;
		private var _parentHeight:Number;
		private var _isPresenter:Boolean;
		
		public function WhiteboardCursor(userId:String, x:Number, y:Number, parentWidth:Number, parentHeight:Number, isPresenter:Boolean) {
			_userId = userId;
			_origX = x;
			_origY = y;
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			_isPresenter = isPresenter;
			
			drawCursor();
			setPosition();
		}
		
		public function updatePosition(x:Number, y:Number):void {
			_origX = x;
			_origY = y;
			
			setPosition();
		}
		
		public function updateParentSize(parentWidth:Number, parentHeight:Number):void {
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			
			setPosition();
		}
		
		public function updatePresenter(isPresenter:Boolean):void {
			_isPresenter = isPresenter;
			
			drawCursor();
		}
		
		private function setPosition():void {
			x = denormalize(_origX, _parentWidth);
			y = denormalize(_origY, _parentHeight);
			
			if (isCursorOutsideWindow()) {
				hideCursor()
			} else {
				showCursor();
			}	
		}
		
		private function showCursor():void {
			visible = true;
		}
		
		private function hideCursor():void{
			visible = false;
		}
		
		private function isCursorOutsideWindow():Boolean {
			return (_origX > 100 || _origX < 0 ||
					_origY > 100 || _origY < 0);
		}
		
		private function drawCursor():void {
			var cursorColor:uint = (_isPresenter ? PRESENTER_COLOR : OTHER_COLOR);
			
			graphics.clear();
			graphics.lineStyle(6, cursorColor, 0.6);
			graphics.drawCircle(0,0,2.5);
		}
		
		private function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
	}
}