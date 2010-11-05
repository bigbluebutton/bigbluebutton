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
	 * The DrawObject class provides an interface for other geometric representations.
	 * This is a simple implementation of the Template design pattern. Other classes extend the
	 * DrawObject class and inherit it's methods.
	 * <p>
	 * The use of the Template pattern allows other classes to create and call methods on the DrawObject
	 * without having to know anything about the different implementations of those method
	 * @author dzgonjan
	 * 
	 */	
	public class DrawObject
	{
		public static const PENCIL:String = "pencil";
		public static const RECTANGLE:String = "rectangle";
		public static const ELLIPSE:String = "ellipse";
		
		protected var type:String;
		protected var shape:Array;
		protected var color:uint;
		protected var thickness:uint;
		public var parentWidth:Number;
		public var parentHeight:Number;
		
		/**
		 * The default constructor for the DrawObject 
		 * 
		 */		
		public function DrawObject(type:String, segment:Array, color:uint, thickness:uint)
		{
			this.type = type;
			this.shape = segment;
			this.color = color;
			this.thickness = thickness;
			this.optimize();
		}
		
		/**
		 * Returns the type of DrawObject this class is 
		 * @return a string representing the type
		 * 
		 */		
		public function getType():String{
			return this.type;
		}
		
		/**
		 * Returns the array of integers holding the different points needed to build this particular DrawObject 
		 * @return 
		 * 
		 */		
		public function getShapeArray():Array{
			return this.shape;
		}
		
		/**
		 * Returns the Color of the DrawObject
		 * @return The color, represented as a uint 
		 * 
		 */		
		public function getColor():uint{
			return this.color;
		}
		
		/**
		 * Returns the thickness of the DrawObject 
		 * @return The thickness, represented as a uint
		 * 
		 */		
		public function getThickness():uint{
			return this.thickness;
		}
		
		protected function optimize():void{
			
		}

	}
}