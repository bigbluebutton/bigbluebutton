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
	/**
	 * If you use the ToolbarButtonEvent to add a UIComponent to the top toolbar, it must implement this interface.
	 * 
	 */	
	public interface IBbbToolbarComponent
	{
		/**
		 * If you want your button to appear to the right or left of other buttons (for visual purposes), return one of
		 * MainToolbar.ALIGN_LEFT
		 * MainToolbar.ALIGN_RIGHT
		 * 
		 */		
		function getAlignment():String;
	}
}