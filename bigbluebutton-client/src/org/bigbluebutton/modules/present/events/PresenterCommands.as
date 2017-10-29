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
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	/**
	 * This class represents all the events that a presenter would send to the viewers. In other words, these are the events that are propagated
	 * across the server and to other clients, unlike all the other events, which are local.  
	 * @author Denis
	 * 
	 */	
	public class PresenterCommands extends Event
	{
		public static const GOTO_SLIDE:String = "GOTO_SLIDE_COMMAND";
		public static const ZOOM:String = "ZOOM_COMMAND";
		public static const RESIZE:String = "RESIZE_COMMAND";
		public static const SHARE_PRESENTATION_COMMAND:String = "SHARE_PRESENTATION_COMMAND";
		
		//Parameter for the slide navigation events
		public var slideNumber:Number;
		
		//Parameters for the move event
		public var xOffset:Number;
		public var yOffset:Number;
		
		public var slideToCanvasWidthRatio:Number;
		public var slideToCanvasHeightRatio:Number;
		
		//Parameters for the share event
		public var presentationName:String;
		public var podId: String;
		
		public function PresenterCommands(type:String, _podId: String, slideNumber:Number = 0)
		{
			super(type, true, false);
			this.podId = _podId;
			this.slideNumber = slideNumber;
		}

	}
}
