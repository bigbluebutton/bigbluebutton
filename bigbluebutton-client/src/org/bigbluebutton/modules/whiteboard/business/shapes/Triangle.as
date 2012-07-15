/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
 * Author: Ajay Gopinath <ajgopi124(at)gmail(dot)com>
 */
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import flash.display.Shape;
	
	import org.bigbluebutton.common.LogUtil;
	
	public class Triangle extends DrawObject
	{
		/**
		 * The dafault constructor. Creates a Triangle DrawObject 
		 * @param segment the array representing the points needed to create this Triangle
		 * @param color the Color of this Triangle
		 * @param thickness the thickness of this Triangle
		 * @param trans the transparency of this Triangle
		 */	
		
		public function Triangle(segment:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint, trans:Boolean)
		{
			super(DrawObject.TRIANGLE, segment, color, thickness, fill, fillColor, trans);
		}
		
		/**
		 * Gets rid of the unnecessary data in the segment array, so that the object can be more easily passed to
		 * the server 
		 * 
		 */		
		override protected function optimize():void{
			var x1:Number = this.shape[0];
			var y1:Number = this.shape[1];
			var x2:Number = this.shape[this.shape.length - 2];
			var y2:Number = this.shape[this.shape.length - 1];
			
			this.shape = new Array();
			this.shape.push(x1);
			this.shape.push(y1);
			this.shape.push(x2);
			this.shape.push(y2);
		}
		
		override public function makeGraphic(parentWidth:Number, parentHeight:Number):void {
			if(!fill)
				this.graphics.lineStyle(getThickness(), getColor(), getTransparencyLevel());
			else this.graphics.lineStyle(getThickness(), getColor());
			var arrayEnd:Number = getShapeArray().length;
			var startX:Number = denormalize(getShapeArray()[0], parentWidth);
			var startY:Number = denormalize(getShapeArray()[1], parentHeight);
			var triangleWidth:Number = denormalize(getShapeArray()[arrayEnd-2], parentWidth) - startX;
			var triangleHeight:Number = denormalize(getShapeArray()[arrayEnd-1], parentHeight) - startY;
			LogUtil.debug(startX + " " + startY + " " + triangleWidth + " " + triangleHeight);
			if(fill) this.graphics.beginFill(getFillColor(), getTransparencyLevel());
			this.graphics.moveTo(startX+triangleWidth/2, startY); 
			this.graphics.lineTo(startX+triangleWidth, startY+triangleHeight); 
			this.graphics.lineTo(startX, triangleHeight+startY); 
			this.graphics.lineTo(startX+triangleWidth/2, startY); 
		}
		
		override public function getProperties():Array {
			var props:Array = new Array();
			props.push(this.type);
			props.push(this.shape);
			props.push(this.color);
			props.push(this.thickness);
			props.push(this.fill);
			props.push(this.fillColor);
			props.push(this.transparent);
			props.push(this.width);
			props.push(this.height);
			return props;
		}
	}
}