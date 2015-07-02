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
	import flash.display.DisplayObject;
	import flash.display.Shape;
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
		public static const POLL:String = "poll_result";
				
		/**
		 * Status = [START, UPDATE, END]
		 */ 
		public static const DRAW_UPDATE:String = "DRAW_UPDATE";
		public static const DRAW_END:String = "DRAW_END";
		public static const DRAW_START:String = "DRAW_START";
				
        private var _id:String;
        private var _type:String;
        
        private var _status:String;
		
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
		
        public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
            
        }
        
        public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
            
        }
	}
}