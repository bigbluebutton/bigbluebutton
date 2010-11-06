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
		 * @return the DrawObject created from the parameters
		 * 
		 */		
		public function makeDrawObject(type:String, shape:Array, color:uint, thickness:uint):DrawObject{
			var d:DrawObject = null;
			if (type == DrawObject.PENCIL){
				d = makePencil(shape, color, thickness);
			} else if (type == DrawObject.RECTANGLE){
				d = makeRectangle(shape, color, thickness);
			} else if (type == DrawObject.ELLIPSE){
				d = makeEllipse(shape, color, thickness);
			}
			return d;
		}
		
		/**
		 * A helper method for the makeDrawObject method which creates a Pencil DrawObject 
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @return the Pencil DrawObject created from the parameters
		 * 
		 */		
		public function makePencil(shape:Array, color:uint, thickness:uint):DrawObject{
			return new Pencil(shape, color, thickness);
		}
		
		/**
		 * A helper method for the makeDrawObject method which creates a Rectangle DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @return the Rectangle DrawObject created from the parameters
		 * 
		 */		
		public function makeRectangle(shape:Array, color:uint, thickness:uint):DrawObject{
			return new Rectangle(shape, color, thickness);
		}
		
		/**
		 * A helper method for the makeDrawObject method whitch creates an Ellipse DrawObject
		 * <p>
		 * Even though it is a helper method it is made public for testing purposes
		 * @param shape The array holding the different points needed to create the DrawObject
		 * @param color The color of the DrawObject to be created
		 * @param thickness The thickness of the DrawObject to be created
		 * @return the Ellipse DrawObject created from the parameters
		 * 
		 */		
		public function makeEllipse(shape:Array, color:uint, thickness:uint):DrawObject{
			return new Ellipse(shape, color, thickness);
		}

	}
}