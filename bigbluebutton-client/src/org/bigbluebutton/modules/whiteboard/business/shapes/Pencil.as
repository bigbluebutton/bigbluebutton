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
	 * The Pencil class. Extends a DrawObject 
	 * @author dzgonjan
	 * 
	 */	
	public class Pencil extends DrawObject
	{
		/**
		 * the default constructor. Creates a Pencil DrawObject. 
		 * @param segment the array representing the points needed to create this Pencil
		 * @param color the Color of this Pencil
		 * @param thickness the thickness of this Pencil
		 * @param trans the transparency of this Pencil
		 */		
		public function Pencil(segment:Array, color:uint, thickness:uint, trans:Boolean)
		{
			super(DrawObject.PENCIL, segment, color, thickness, false, false);
		}
		
		override public function makeGraphic(parentWidth:Number, parentHeight:Number):void {
			this.graphics.lineStyle(getThickness(), getColor());
			
			var graphicsCommands:Vector.<int> = new Vector.<int>();
			graphicsCommands.push(1);
			var coordinates:Vector.<Number> = new Vector.<Number>();
			coordinates.push(denormalize(getShapeArray()[0], parentWidth), denormalize(getShapeArray()[1], parentHeight));
			
			for (var i:int = 2; i < getShapeArray().length; i += 2){
				graphicsCommands.push(2);
				coordinates.push(denormalize(getShapeArray()[i], parentWidth), denormalize(getShapeArray()[i+1], parentHeight));
			}
			
			this.graphics.drawPath(graphicsCommands, coordinates);
			this.alpha = 1;
		}
		
		override public function getProperties():Array {
			var props:Array = new Array();
			props.push(this.type);
			props.push(this.shape);
			props.push(this.color);
			props.push(this.thickness);
			props.push(false);
			props.push(false);
			props.push(this.width);
			props.push(this.height);
			return props;
		}
	}
}