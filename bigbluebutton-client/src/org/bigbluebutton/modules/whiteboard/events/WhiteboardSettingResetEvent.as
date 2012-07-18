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
package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	/**
	 * This class is used to notify listeners of this event that 
	 * a 'toggle' setting of a certain property has been changed
	 * to a certain value. It is used for example in changing between
	 * pages so that the values in the WhiteboardToolbar are synced
	 * with the properties of the current page. (ex. in grid mode)
	*/
	public class WhiteboardSettingResetEvent extends Event
	{
		public static const FILL_CHANGED:String = "FILL_CHANGED";
		public static const TRANSPARENCY_CHANGED:String = "TRANSPARENCY_CHANGED";
		public static const GRID_CHANGED:String = "GRID_CHANGED";
		
		public var value:Boolean;
		
		public function WhiteboardSettingResetEvent(type:String)
		{
			super(type,true,false);
		}
	}
}