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
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	
	public class Line extends AsymetricDrawObject
	{
		public function Line(id:String, type:String, status:String)
		{
			super(id, type, status);
		}
				
		override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoomPercentage:Number):void {
//			LogUtil.debug("Drawing LINE");
			var ao:Object = a.annotation;
			
			setDenormalizedPoints(ao.points as Array, parentWidth, parentHeight);
			_rawThickness = ao.thickness as uint;
			_drawColor = ao.color as uint;
			_fillOn = ao.fill as Boolean;
			_fillColor = ao.fillColor as uint;
			_transparencyOn = ao.transparency as Boolean;
			
			this.graphics.lineStyle(this.getThickness(zoomPercentage), ao.color);
			var arrayEnd:Number = (ao.points as Array).length;
			var startX:Number = denormalize((ao.points as Array)[0], parentWidth);
			var startY:Number = denormalize((ao.points as Array)[1], parentHeight);
			var endX:Number = denormalize((ao.points as Array)[arrayEnd-2], parentWidth);
			var endY:Number = denormalize((ao.points as Array)[arrayEnd-1], parentHeight);
			this.alpha = 1;
			this.x = startX;
			this.y = startY;
			this.graphics.lineTo(endX-startX, endY-startY);			
		}
		
		override public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoomPercentage:Number):void {
			this.graphics.clear();
			draw(a, parentWidth, parentHeight, zoomPercentage);
		}
		
		override public function getOriginatedToolType():String {
			return DrawObject.LINE;
		}
	}
}