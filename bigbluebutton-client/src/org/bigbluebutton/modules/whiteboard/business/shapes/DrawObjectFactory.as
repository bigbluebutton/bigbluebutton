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
	/**
	 * The DrawObjectFactory class receives a series of parameters and constructs an appropriate 
	 * concrete DrawObject given those parameters.
	 * <p>
	 * DrawObjectFactory is a simple implementation of the Factory design pattern 
	 * @author dzgonjan
	 * 
	 */	
	public class DrawObjectFactory
	{
		/**
		 * The default constructor 
		 * 
		 */		
		public function DrawObjectFactory()
		{
		}
		
		/**
		 * Creates a DrawObject by calling the appropriate helper method 
		 * @param type The type of DrawObject to be created
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param fill Whether or not the DrawObject should be filled or not. Doesn't apply for Pencil/Line tools.
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the DrawObject created from the parameters
		 * 
		 */		
		public function makeDrawObject(type:String, shape:Array, color:uint, thickness:uint,
										fill:Boolean, fillColor:uint, trans:Boolean):DrawObject{
			var d:DrawObject = null;
			if (type == DrawObject.PENCIL){
				d = makePencil(shape, color, thickness, trans);
			} else if (type == DrawObject.RECTANGLE){
				d = makeRectangle(shape, color, thickness, fill, fillColor, trans);
			} else if (type == DrawObject.ELLIPSE){
<<<<<<< HEAD
				d = makeEllipse(shape, color, thickness);
			} else if (type == DrawObject.TEXT){
                d = makeText(shape, color, thickness);
                d.getShapeArray().push(d.getShape().width);
                d.getShapeArray().push(d.getShape().height);
            }
            
=======
				d = makeEllipse(shape, color, thickness, fill, fillColor, trans);
			}  else if (type == DrawObject.TRIANGLE){
				d = makeTriangle(shape, color, thickness, fill, fillColor, trans);
			} else if (type == DrawObject.LINE){
				d = makeLine(shape, color, thickness, trans);
			} else if (type == DrawObject.HIGHLIGHTER){
				d = makeHighlighter(shape, color, thickness, trans);
			} else if (type == DrawObject.ERASER){
				d = makeEraser(shape, color, thickness, trans);
			}
>>>>>>> ajay/bbb-whiteboard-additions
			return d;
		}
		
		/**
		 * A helper method for the makeDrawObject method which creates a Pencil DrawObject 
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Pencil DrawObject created from the parameters
		 * 
		 */		
<<<<<<< HEAD
		public function makePencil(shape:Array, color:uint, thickness:uint):DrawObject{
			return new Pencil(shape, color, thickness);
            
=======
		public function makePencil(shape:Array, color:uint, thickness:uint, trans:Boolean):DrawObject{
			return new Pencil(shape, color, thickness, trans);
>>>>>>> ajay/bbb-whiteboard-additions
		}
		
		/**
		 * A helper method for the makeDrawObject method which creates a Rectangle DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param fill Whether or not the DrawObject should be filled or not.
		 * @param fillColor if fill is true, the color to fill the DrawObject
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Rectangle DrawObject created from the parameters
		 * 
		 */		
		public function makeRectangle(shape:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint, trans:Boolean):DrawObject{
			return new Rectangle(shape, color, thickness, fill, fillColor, trans);
		}
		
		/**
		 * A helper method for the makeDrawObject method whitch creates an Ellipse DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param fill Whether or not the DrawObject should be filled or not.
		 * @param fillColor if fill is true, the color to fill the DrawObject
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Ellipse DrawObject created from the parameters
		 * 
		 */		
		public function makeEllipse(shape:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint,trans:Boolean):DrawObject{
			return new Ellipse(shape, color, thickness, fill, fillColor, trans);
		}
		
		/**
		 * A helper method for the makeDrawObject method whitch creates a Line DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Line DrawObject created from the parameters
		 * 
		 */
		
		public function makeLine(shape:Array, color:uint, thickness:uint, trans:Boolean):DrawObject{
			return new Line(shape, color, thickness, trans);
		}
		
		/**
		 * A helper method for the makeDrawObject method whitch creates a Highlighter DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Highlighter DrawObject created from the parameters
		 * 
		 */
		
		public function makeHighlighter(shape:Array, color:uint, thickness:uint, trans:Boolean):DrawObject{
			return new Highlighter(shape, color, thickness, trans);
		}

		/**
		 * A helper method for the makeDrawObject method whitch creates an Eraser DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Eraser DrawObject created from the parameters
		 * 
		 */
		
		public function makeEraser(shape:Array, color:uint, thickness:uint, trans:Boolean):DrawObject{
			return new Eraser(shape, color, thickness, trans);
		}
		
		/**
		 * A helper method for the makeDrawObject method whitch creates a Triangle DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @param fill Whether or not the DrawObject should be filled or not.
		 * @param fillColor if fill is true, the color to fill the DrawObject
		 * @param trans Whether or not the DrawObject should be transparent.
		 * @return the Triangle DrawObject created from the parameters
		 * 
		 */
		
		public function makeTriangle(shape:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint, trans:Boolean):DrawObject{
			return new Triangle(shape, color, thickness, fill, fillColor, trans);
		}

        public function makeText(shape:Array, color:uint, thickness:uint):DrawObject{
            return new Text(shape, color, thickness);
        }
	}
}