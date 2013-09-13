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
	import flash.display.DisplayObject;
	
	import org.bigbluebutton.common.LogUtil;

	public interface GraphicObject {
		function get type():String;
		
		function get id():String;
				
		function denormalize(val:Number, side:Number):Number;
		
		function normalize(val:Number, side:Number):Number;
				
		function makeGraphic(parentWidth:Number, parentHeight:Number):void;

		function movePoints(distanceX:Number, distanceY:Number, parentWidth:Number, parentHeight:Number):void;
		
		function changeTopLeft(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void;
		
		function changeTopMiddle(newY:Number, parentHeight:Number):void;
		
		function changeTopRight(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void;
		
		function changeMiddleLeft(newX:Number, parentWidth:Number):void;
		
		function changeMiddleRight(newX:Number, parentWidth:Number):void;
		
		function changeBottomLeft(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void;
		
		function changeBottomMiddle(newY:Number, parentHeight:Number):void;
		
		function changeBottomRight(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void;
		
	}
}