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
	 * IBBBModuleWindow should be implemented by any MDIWindow class that you wish to display on the main canvas of the client.
	 * Dispatch an org.bigbluebutton.main.events.OpenWindowEvent, passing in your MDIWindow instance that implements this interface.
	 * The window will be added to the main canvas area.
	 */	
	public interface IBbbModuleWindow
	{	
		/**
		 * Specifies the default position you'd like your window to appear in. Possible values are: 
		 * <code>MainCanvas.TOP_LEFT</code>
		 * <code>MainCanvas.BOTTOM_LEFT</code>
		 * <code>MainCanvas.MIDDLE</code>
		 * <code>MainCanvas.BOTTOM</code>
		 * <code>MainCanvas.RIGHT</code>
		 * <code>MainCanvas.POPUP</code>
		 * @return the preffered position of the window.
		 * 
		 */		
		function getPrefferedPosition():String;
		
		/**
		 * Returns an indentifier to be used by the LayoutModule to position the window.
		 */
		function getName():String;
	}
}