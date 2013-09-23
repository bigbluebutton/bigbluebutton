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
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import flash.display.Sprite;
	
	import org.bigbluebutton.modules.whiteboard.models.Annotation;

	/**
	 * The DrawObject class provides an interface for other geometric representations.
	 * This is a simple implementation of the Template design pattern. Other classes extend the
	 * DrawObject class and inherit it's methods.
	 * <p>
	 * The use of the Template pattern allows other classes to create and call methods on the DrawObject
	 * without having to know anything about the different implementations of those method
	 * @author dzgonjan
	 * 
	 */	
	public class DrawObject extends Sprite implements GraphicObject {
		public static const PENCIL:String = "pencil";
		public static const HIGHLIGHTER:String = "highlighter";
		public static const ERASER:String = "eraser";
		public static const RECTANGLE:String = "rectangle";
		public static const ELLIPSE:String = "ellipse";
        public static const TEXT:String = "text";      
		public static const TRIANGLE:String = "triangle";
		public static const LINE:String = "line";	
				
		/**
		 * Status = [START, UPDATE, END]
		 */ 
		public static const DRAW_UPDATE:String = "DRAW_UPDATE";
		public static const DRAW_END:String = "DRAW_END";
		public static const DRAW_START:String = "DRAW_START";
		public static const DRAW_MODIFIED:String = "DRAW_MODIFIED";
		public static const DRAW_DELETED:String = "DRAW_DELETED";
				
        private var _id:String;
        private var _type:String;
        
        private var _status:String;
		protected var _denormalizedPoints:Array = new Array();
		protected var _rawThickness:uint;
		protected var _drawColor:uint = 0;
		protected var _fillOn:Boolean;
		protected var _fillColor:uint;
		protected var _transparencyOn:Boolean;
		private var _isLockingDenormalizedPoints:Boolean = false;
		
		/**
		 * ID we can use to match the shape in the client's view
		 * so we can use modify it; a unique identifier of each GraphicObject
		 */
		private var ID:String = WhiteboardConstants.ID_UNASSIGNED;
		
		/**
		 * The default constructor for the DrawObject 
		 * 
		 */		
		public function DrawObject(id:String, type:String, status:String) {
            _id = id;
            _type = type;
            _status = status;
            this.buttonMode = true;
		}
		
        public function get id():String {
            return _id;
        }
        
        public function get type():String {
            return _type;
        }
        
        public function get status():String {
            return _status;
        }
        
        public function set status(s:String):void {
            _status = s;
        }
		
		public function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		public function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
        
        public function makeGraphic(parentWidth:Number, parentHeight:Number):void {}
		
        public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoomPercentage:Number):void {
            
        }
        
        public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoomPercentage:Number):void {
            
        }

        public function getOriginatedToolType():String {
			return null; 
		}
		
		public function getThickness(zoomPercentage:Number = 0):uint{
			if (zoomPercentage == 0) {
				return this._rawThickness;
			}
			return uint(this._rawThickness * zoomPercentage / 100);
		}
		
		public function get drawColor():uint {
			return _drawColor;
		}
		
		public function get fillOn():Boolean {
			return _fillOn;
		}
		
		public function get fillColor():uint {
			return _fillColor;
		}
		
		public function get transparencyOn():Boolean {
			return _transparencyOn;
		}
		
		public function lockDenormalizedPoints():void {
			_isLockingDenormalizedPoints = true;
		}
		
		public function unlockDenormalizedPoints():void {
			_isLockingDenormalizedPoints = false;
		}
		
		protected function setDenormalizedPoints(points:Array, parentWidth:Number, parentHeight:Number):void {
			if (_isLockingDenormalizedPoints) {
				return;
			}
			
			_denormalizedPoints.length = 0;
			
			for (var i:int = 0; i < points.length - 1 ; i += 2) {
				_denormalizedPoints.push(denormalize(points[i], parentWidth));
				_denormalizedPoints.push(denormalize(points[i + 1], parentHeight));
			}
		}
		
		public function get denormalizedPoints():Array {
			return _denormalizedPoints;
		}
		
		public function movePoints(distanceX:Number, distanceY:Number, parentWidth:Number, parentHeight:Number):void {
			for (var i:int = 0; i < _denormalizedPoints.length - 1 ; i += 2) {
				_denormalizedPoints[i] += distanceX;
				_denormalizedPoints[i + 1] += distanceY;
			}
		}
		
		public function getX():Number {
			var x1:Number = _denormalizedPoints[0];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			
			return Math.min(x1, x2);
		}
		
		public function getY():Number {
			var y1:Number = _denormalizedPoints[1];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			return Math.min(y1, y2);
		}
		
		public function getWidth():Number {
			var x1:Number = _denormalizedPoints[0];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			
			return Math.abs(x1 - x2);
		}
		
		public function getHeight():Number {
			var y1:Number = _denormalizedPoints[1];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			return Math.abs(y1 - y2);
		}
		
		
		public function changeTopLeft(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 > y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = newX;
			_denormalizedPoints[firstXIndex + 1] = newY;
			_denormalizedPoints[secondXIndex] = Math.max(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.max(y1, y2);
		}
		
		public function changeTopMiddle(newY:Number, parentHeight:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 > y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = Math.min(x1, x2);
			_denormalizedPoints[firstXIndex + 1] = newY;
			_denormalizedPoints[secondXIndex] = Math.max(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.max(y1, y2);
		}
		
		public function changeTopRight(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 > y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = newX;
			_denormalizedPoints[firstXIndex + 1] = newY;
			_denormalizedPoints[secondXIndex] = Math.min(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.max(y1, y2);
		}
		
		public function changeMiddleLeft(newX:Number, parentWidth:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
		
			if (y1 > y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = newX;
			_denormalizedPoints[firstXIndex + 1] = Math.min(y1, y2);
			_denormalizedPoints[secondXIndex] = Math.max(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.max(y1, y2);
		}
		
		public function changeMiddleRight(newX:Number, parentWidth:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 > y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = newX;
			_denormalizedPoints[firstXIndex + 1] = Math.min(y1, y2);
			_denormalizedPoints[secondXIndex] = Math.min(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.max(y1, y2);
		}
		
		public function changeBottomLeft(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 < y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = newX;
			_denormalizedPoints[firstXIndex + 1] = newY;
			_denormalizedPoints[secondXIndex] = Math.max(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.min(y1, y2);
		}
		
		public function changeBottomMiddle(newY:Number, parentHeight:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 < y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = Math.min(x1, x2);
			_denormalizedPoints[firstXIndex + 1] = newY;
			_denormalizedPoints[secondXIndex] = Math.max(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.min(y1, y2);
		}
		
		public function changeBottomRight(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var x1:Number = _denormalizedPoints[0];
			var y1:Number = _denormalizedPoints[1];
			var x2:Number = _denormalizedPoints[_denormalizedPoints.length - 2];
			var y2:Number = _denormalizedPoints[_denormalizedPoints.length - 1];
			
			var firstXIndex:int = 0;
			var secondXIndex:int = 2;
			
			if (y1 < y2) {
				firstXIndex = 2;
				secondXIndex = 0;
			}
			
			_denormalizedPoints.length = 0;
			_denormalizedPoints[firstXIndex] = newX;
			_denormalizedPoints[firstXIndex + 1] = newY;
			_denormalizedPoints[secondXIndex] = Math.min(x1, x2);
			_denormalizedPoints[secondXIndex + 1] = Math.min(y1, y2);
		}
	}
}