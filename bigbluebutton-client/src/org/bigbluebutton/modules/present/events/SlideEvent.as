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
	import org.bigbluebutton.modules.present.managers.Slide;
	import flash.events.Event;
	import flash.utils.ByteArray;
	
	public class SlideEvent extends Event
	{
		public static const SLIDE_LOADED:String = "Slide Loaded";
		public static const LOAD_CURRENT_SLIDE:String = "Load Current Slide";
		
		public var slideNumber:Number;
		public var slide:ByteArray;
		public var page:Slide;
		
		public function SlideEvent(type:String)
		{
			super(type, true, false);
		}

	}
}