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
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import flash.display.Shape;
	
	/**
	 * The ShapeFactory receives DrawObjects and converts them to Flash Shapes which can then be displayed
	 * <p>
	 * This approach is necessary because Red5 does not allow Graphical Objects to be stored 
	 * in remote shared objects 
	 * @author dzgonjan
	 * 
	 */	
	public class ShapeFactory
	{
		private var drawFactory:DrawObjectFactory;
		private var _parentWidth:int = 0;
		private var _parentHeight:int = 0;
		
		public function ShapeFactory()
		{
			drawFactory = new DrawObjectFactory();
		}
		
		public function setParentDim(width:int, height:int):void {
			_parentWidth = width;
			_parentHeight = height;
		}
		
		/**
		 * Creates a Flash Shape, given a DrawObject representation of it 
		 * @param shape
		 * @return 
		 * 
		 */		
		public function makeShape(shape:DrawObject):DrawObject{
			if (shape.getType() == DrawObject.PENCIL){
				return makePencil(shape as Pencil);
			} else if (shape.getType() == DrawObject.RECTANGLE){
				return makeRectangle(shape as Rectangle);
			} else if (shape.getType() == DrawObject.ELLIPSE){
				return makeEllipse(shape as Ellipse);
			}
			return null;
		}
		
		private function denormalize(val:Number, side:int):Number {
			return (val/100)*side;
		}
		
		private function normalize(val:Number, side:int):Number {
			return (val/side)*100;
		}
		
		public function createDrawObject(type:String, segment:Array, color:uint, thickness:uint):DrawObject {
			var normSegment:Array = new Array();
			for (var i:int = 0; i < segment.length; i += 2) {
				normSegment[i] = normalize(segment[i] , _parentWidth);
				normSegment[i+1] = normalize(segment[i+1], _parentHeight);
			}
			return makeShape(drawFactory.makeDrawObject(type, normSegment, color, thickness));
			//return makeShape(drawFactory.makeDrawObject(type, segment, color, thickness));
		}
		
		/**
		 * Creates a shape from the specified parameters 
		 * @param segment
		 * @param type
		 * @param color
		 * @param thickness
		 * @return A Flash Shape object
		 * 
		 */		
		public function makeFeedback(type:String, segment:Array, color:uint, thickness:uint):DrawObject{
			return makeShape(drawFactory.makeDrawObject(type, segment, color, thickness));
		}
		

		
		/**
		 * Creates a Flash Shape from a Pencil DrawObject 
		 * @param p a Pencil DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makePencil(p:Pencil):DrawObject{
			
			var newShape:Shape = p.getShape();
			newShape.graphics.lineStyle(p.getThickness(), p.getColor());
			
			var graphicsCommands:Vector.<int> = new Vector.<int>();
			graphicsCommands.push(1);
			var coordinates:Vector.<Number> = new Vector.<Number>();
			coordinates.push(denormalize(p.getShapeArray()[0], _parentWidth), denormalize(p.getShapeArray()[1], _parentHeight));
			
			for (var i:int = 2; i < p.getShapeArray().length; i += 2){
				graphicsCommands.push(2);
				coordinates.push(denormalize(p.getShapeArray()[i], _parentWidth), denormalize(p.getShapeArray()[i+1], _parentHeight));
			}

			newShape.graphics.drawPath(graphicsCommands, coordinates);
			
           	if (p.getColor() == 0x000000 || p.getColor() == 0xFFFFFF) newShape.alpha = 1;
           	else newShape.alpha = 0.6;

/*			
			var newShape:Shape = p.getShape();
			newShape.graphics.lineStyle(p.getThickness(), p.getColor());
			
			var graphicsCommands:Vector.<int> = new Vector.<int>();
			var coordinates:Vector.<Number> = new Vector.<Number>();
			
			graphicsCommands.push(1);
			coordinates.push(0, 0);
			graphicsCommands.push(1);
			coordinates.push(p.getShapeArray()[0], p.getShapeArray()[1]);
			
			for (var i:int = 2; i < p.getShapeArray().length; i += 2){
				graphicsCommands.push(2);
				coordinates.push(p.getShapeArray()[i], p.getShapeArray()[i+1]);
			}
			
			newShape.graphics.drawPath(graphicsCommands, coordinates);
			
			if (p.getColor() == 0x000000 || p.getColor() == 0xFFFFFF) newShape.alpha = 1;
			else newShape.alpha = 0.6;
*/			
	        return p;
		}
		
		/**
		 * Creates a Flash Shape from a Rectangle DrawObject 
		 * @param r a Rectangle DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makeRectangle(r:Rectangle):DrawObject{
			var newShape:Shape = r.getShape();
			newShape.graphics.lineStyle(r.getThickness(), r.getColor());
			var arrayEnd:Number = r.getShapeArray().length;
			var x:Number = denormalize(r.getShapeArray()[0], _parentWidth);
			var y:Number = denormalize(r.getShapeArray()[1], _parentHeight);
			var width:Number = denormalize(r.getShapeArray()[arrayEnd-2], _parentWidth) - x;
			var height:Number = denormalize(r.getShapeArray()[arrayEnd-1], _parentHeight) - y;
			
			newShape.graphics.drawRect(x,y,width,height);
			if (r.getColor() == 0x000000 || r.getColor() == 0xFFFFFF) newShape.alpha = 1.0;
			else newShape.alpha = 0.6;
			
			return r;	
		}
		
		/**
		 * Creates a Flash Shape from an Ellipse DrawObject 
		 * @param e an Ellipse DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makeEllipse(e:Ellipse):DrawObject{
			var newShape:Shape = e.getShape();
			newShape.graphics.lineStyle(e.getThickness(), e.getColor());
			var arrayEnd:Number = e.getShapeArray().length;
			var x:Number = denormalize(e.getShapeArray()[0], _parentWidth);
			var y:Number = denormalize(e.getShapeArray()[1], _parentHeight);
			var width:Number = denormalize(e.getShapeArray()[arrayEnd-2], _parentWidth) - x;
			var height:Number = denormalize(e.getShapeArray()[arrayEnd-1], _parentHeight) - y;
			
			newShape.graphics.drawEllipse(x,y,width,height);
			if (e.getColor() == 0x000000 || e.getColor() == 0xFFFFFF) newShape.alpha = 1.0;
			else newShape.alpha = 0.6;
			
			return e;
		}

	}
}