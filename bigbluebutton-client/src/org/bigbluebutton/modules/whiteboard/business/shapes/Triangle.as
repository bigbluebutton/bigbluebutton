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
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	
	public class Triangle extends DrawObject
	{
		
		public function Triangle(id:String, type:String, status:String)
		{
            super(id, type, status);
		}
		
		override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number):void {
			LogUtil.debug("Drawing LINE");
			var ao:Object = a.annotation;
			
			if (!ao.fill)
				this.graphics.lineStyle(ao.thickness, ao.color, ao.transparency ? 0.6 : 1.0);
			else this.graphics.lineStyle(ao.thickness, ao.color);
			
			var arrayEnd:Number = (ao.points as Array).length;
			var startX:Number = denormalize((ao.points as Array)[0], parentWidth);
			var startY:Number = denormalize((ao.points as Array)[1], parentHeight);
			var triangleWidth:Number = denormalize((ao.points as Array)[arrayEnd-2], parentWidth) - startX;
			var triangleHeight:Number = denormalize((ao.points as Array)[arrayEnd-1], parentHeight) - startY;
			
			LogUtil.debug(startX + " " + startY + " " + triangleWidth + " " + triangleHeight);
			
			if (ao.fill) this.graphics.beginFill(ao.fillColor, ao.transparency ? 0.6 : 1.0);
			
			this.graphics.moveTo(startX+triangleWidth/2, startY); 
			this.graphics.lineTo(startX+triangleWidth, startY+triangleHeight); 
			this.graphics.lineTo(startX, triangleHeight+startY); 
			this.graphics.lineTo(startX+triangleWidth/2, startY);
		}
		
		override public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number):void {
			draw(a, parentWidth, parentHeight);
		}			
		
		/**
		 * Gets rid of the unnecessary data in the segment array, so that the object can be more easily passed to
		 * the server 
		 * 
		 */		
		private function optimize():void{
/*			var x1:Number = this.shape[0];
			var y1:Number = this.shape[1];
			var x2:Number = this.shape[this.shape.length - 2];
			var y2:Number = this.shape[this.shape.length - 1];
			
			this.shape = new Array();
			this.shape.push(x1);
			this.shape.push(y1);
			this.shape.push(x2);
			this.shape.push(y2);
*/		}
		
		override public function makeGraphic(parentWidth:Number, parentHeight:Number):void {
/*			if(!fill)
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
*/		}
		
	}
}