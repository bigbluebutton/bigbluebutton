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
package org.bigbluebutton.common
{
	import flash.display.DisplayObject;
	
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	
	/**
	 * An interface currently used to interface the Whiteboard module with the Presentation module in a decoupled sort of way.
	 * 
	 */	
	public interface IBbbCanvas
	{
		function addRawChild(child:DisplayObject):void;
		function removeRawChild(child:DisplayObject):void;
		function doesContain(child:DisplayObject):Boolean;
		function acceptOverlayCanvas(overlay:IBbbCanvas):void;
		function moveCanvas(x:Number, y:Number):void;
		function zoomCanvas(width:Number, height:Number, zoom:Number):void;
		function showCanvas(show:Boolean):void;
	}
}