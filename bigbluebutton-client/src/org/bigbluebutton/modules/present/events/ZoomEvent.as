/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	/**
	 * Several events relating to zooming the slides in an out. Note that the difference betweeen the ZOOM event and the RESIZE event. The ZOOM event increases or decreases
	 * the zoom value of the slide in increments, while the RESIZE event updates the zoom value of the slide in terms of the original value. So for example, a ZOOM event
	 * might send the message to increase the size of the slide by 10% of it's current value, while RESIZE would send a message to enlarge the slide to 300% of it's default
	 * size. 
	 * @author Denis
	 * 
	 */	
	public class ZoomEvent extends Event
	{
		public static const ZOOM:String = "ZOOM";
		public static const MAXIMIZE:String = "MAXIMIZE";
		public static const RESTORE:String = "RESTORE";
		public static const RESIZE:String = "RESIZE";
		
		public var zoomPercentage:Number;
		
		public var xOffset:Number;
		public var yOffset:Number;
		
		public var slideToCanvasWidthRatio:Number;
		public var slideToCanvasHeightRatio:Number;
		
		public function ZoomEvent(type:String)
		{
			super(type, true, false);
		}

	}
}