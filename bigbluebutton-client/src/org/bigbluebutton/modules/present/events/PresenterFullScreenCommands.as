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
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	/**
	 * This class represents all the events that a presenter would send to the viewers. In other words, these are the events that are propagated
	 * across the server and to other clients, unlike all the other events, which are local.  
	 * @author Denis
	 * 
	 */	
	public class PresenterFullScreenCommands extends Event
	{
		public static const SEND_FULLSCREEN_STATUS:String = "SEND_FULLSCREEN_STATUS";
        public static const GET_FULLSCREEN_STATUS:String = "GET_FULLSCREEN_STATUS";
        public static const SET_FULLSCREEN_STATUS:String = "SET_FULLSCREEN_STATUS";

		public var isFullScreen:Boolean ;
        public var curSlideWidth:Number;
        public var curSlideHeight:Number;
        public var viewPortWidth:Number;
        public var viewPortHeight:Number;

		public function PresenterFullScreenCommands(type:String)
		{
			super(type, true, false);
		}

	}
}