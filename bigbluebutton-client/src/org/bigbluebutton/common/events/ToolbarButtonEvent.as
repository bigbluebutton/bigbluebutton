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
package org.bigbluebutton.common.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBbbToolbarComponent;
	
	/**
	 * Allows you to add a button to the top toolbar of bbb-client. Dispatch an instance of ToolbarButtonEvent with the
	 * reference to the button attached.
	 * 
	 */	
	public class ToolbarButtonEvent extends Event
	{
		public static const ADD:String = "Add Toolbar Button Event";
		public static const REMOVE:String = "Remove Toolbar Button Event";
		
		/**
		 * The ui component to add to the toolbar. 
		 */		
		public var button:IBbbToolbarComponent;
		
		public function ToolbarButtonEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
