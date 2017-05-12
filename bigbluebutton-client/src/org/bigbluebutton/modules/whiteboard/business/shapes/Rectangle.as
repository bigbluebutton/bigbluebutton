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
	import flash.display.CapsStyle;
	import flash.display.JointStyle;

	/**
	 * The Rectangle class. Extends a DrawObject 
	 * @author dzgonjan
	 * 
	 */	
	public class Rectangle extends DrawObject
	{
		public function Rectangle(id:String, type:String, status:String, userId:String) {
			super(id, type, status, userId);
		}
		
		override protected function makeGraphic():void {
			this.graphics.clear();
//			LogUtil.debug("Drawing RECTANGLE");
			this.graphics.lineStyle(denormalize(_ao.thickness, _parentWidth), _ao.color, _ao.transparency ? 0.6 : 1.0, true, "normal", CapsStyle.NONE, JointStyle.MITER);
			
			var arrayEnd:Number = (_ao.points as Array).length;
			var startX:Number = denormalize((_ao.points as Array)[0], _parentWidth);
			var startY:Number = denormalize((_ao.points as Array)[1], _parentHeight);
			var width:Number = denormalize((_ao.points as Array)[arrayEnd-2], _parentWidth) - startX;
			var height:Number = denormalize((_ao.points as Array)[arrayEnd-1], _parentHeight) - startY;
			
			if (_ao.fill) this.graphics.beginFill(_ao.fillColor, _ao.transparency ? 0.6 : 1.0);
			
			this.graphics.drawRect(startX, startY, width, height);
		}
	}
}