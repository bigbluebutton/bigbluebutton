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
		
		public function ShapeFactory()
		{
			drawFactory = new DrawObjectFactory();
		}
		
		/**
		 * Creates a Flash Shape, given a DrawObject representation of it 
		 * @param shape
		 * @return 
		 * 
		 */		
		public function makeShape(shape:DrawObject):Shape{
			var s:Shape = null;
			if (shape.getType() == DrawObject.PENCIL){
				s = makePencil(Pencil(shape));
			} else if (shape.getType() == DrawObject.RECTANGLE){
				s = makeRectangle(Rectangle(shape));
			} else if (shape.getType() == DrawObject.ELLIPSE){
				s = makeEllipse(Ellipse(shape));
			}
			return s;
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
		public function makeFeedback(segment:Array, type:String, color:uint, thickness:uint):Shape{
			return makeShape(drawFactory.makeDrawObject(type,segment, color, thickness));
		}
		
		/**
		 * Creates a Flash Shape from a Pencil DrawObject 
		 * @param p a Pencil DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makePencil(p:Pencil):Shape{
			var newShape:Shape = new Shape();
			newShape.graphics.lineStyle(p.getThickness(), p.getColor());
			
			var graphicsCommands:Vector.<int> = new Vector.<int>();
			graphicsCommands.push(1);
			var coordinates:Vector.<Number> = new Vector.<Number>();
			coordinates.push(p.getShapeArray()[0], p.getShapeArray()[1]);
			
			for (var i:int = 2; i < p.getShapeArray().length; i += 2){
				graphicsCommands.push(2);
				coordinates.push(p.getShapeArray()[i], p.getShapeArray()[i+1]);
			}

			newShape.graphics.drawPath(graphicsCommands, coordinates);
			
           	if (p.getColor() == 0x000000 || p.getColor() == 0xFFFFFF) newShape.alpha = 1;
           	else newShape.alpha = 0.6;
	            
	        return newShape;
		}
		
		/**
		 * Creates a Flash Shape from a Rectangle DrawObject 
		 * @param r a Rectangle DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makeRectangle(r:Rectangle):Shape{
			var newShape:Shape = new Shape();
			newShape.graphics.lineStyle(r.getThickness(), r.getColor());
			var arrayEnd:Number = r.getShapeArray().length;
			var x:Number = r.getShapeArray()[0];
			var y:Number = r.getShapeArray()[1];
			var width:Number = r.getShapeArray()[arrayEnd-2] - x;
			var height:Number = r.getShapeArray()[arrayEnd-1] - y;
			
			newShape.graphics.drawRect(x,y,width,height);
			if (r.getColor() == 0x000000 || r.getColor() == 0xFFFFFF) newShape.alpha = 1.0;
			else newShape.alpha = 0.6;
			
			return newShape;	
		}
		
		/**
		 * Creates a Flash Shape from an Ellipse DrawObject 
		 * @param e an Ellipse DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makeEllipse(e:Ellipse):Shape{
			var newShape:Shape = new Shape();
			newShape.graphics.lineStyle(e.getThickness(), e.getColor());
			var arrayEnd:Number = e.getShapeArray().length;
			var x:Number = e.getShapeArray()[0];
			var y:Number = e.getShapeArray()[1];
			var width:Number = e.getShapeArray()[arrayEnd-2] - x;
			var height:Number = e.getShapeArray()[arrayEnd-1] - y;
			
			newShape.graphics.drawEllipse(x,y,width,height);
			if (e.getColor() == 0x000000 || e.getColor() == 0xFFFFFF) newShape.alpha = 1.0;
			else newShape.alpha = 0.6;
			
			return newShape;
		}

	}
}