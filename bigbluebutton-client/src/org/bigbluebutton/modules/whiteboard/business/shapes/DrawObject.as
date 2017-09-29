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
	import flash.display.Shape;
	
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
	public class DrawObject extends Shape implements GraphicObject {
        private var _id:String;
        private var _type:String;
        private var _status:String;
        private var _userId:String;
		
		protected var _ao:Object;
		protected var _parentWidth:Number;
		protected var _parentHeight:Number;
		
		/**
		 * The default constructor for the DrawObject 
		 * 
		 */		
		public function DrawObject(id:String, type:String, status:String, userId:String) {
            _id = id;
            _type = type;
            _status = status;
            _userId = userId;
		}
		
        public function get id():String {
            return _id;
        }
        
        public function get toolType():String {
            return _type;
        }
        
        public function get userId():String {
            return _userId;
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
		
		protected function makeGraphic():void {}
		
        public function draw(a:Annotation, parentWidth:Number, parentHeight:Number):void {
			_ao = a.annotation;
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			
			makeGraphic();
		}
		
		public function redraw(parentWidth:Number, parentHeight:Number):void {
			// in some cases (like moving the window around) a redraw is called with identical information as previous values
			if (_parentWidth != parentWidth || _parentHeight != parentHeight) {
				_parentWidth = parentWidth;
				_parentHeight = parentHeight;
				makeGraphic();
			}
		}
		
		public function updateAnnotation(a:Annotation):void {
			_ao = a.annotation;
			
			makeGraphic();
		}
	}
}