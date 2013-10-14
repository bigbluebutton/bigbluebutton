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
package org.bigbluebutton.common.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBbbModuleWindow;

	/**
	 * Allows you to remove an MDIWindow from the main canvas. You must pass in a reference to the window you'd like removed.
	 * 
	 */	
	public class CloseWindowEvent extends Event
	{
		/**
		 * The window to be removed. 
		 */		
		public var window:IBbbModuleWindow;
		
		public static const CLOSE_WINDOW_EVENT:String = 'CLOSE_WINDOW_EVENT';
		
		public function CloseWindowEvent(type:String=CLOSE_WINDOW_EVENT, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}