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
package org.bigbluebutton.modules.listeners
{
	/**
	 * This class holds some of the constants relevant to this module 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ListenersModuleConstants
	{
		public static const START:String       = "start module";
		public static const STOP:String       = "stop module";
		public static const STARTED:String       = "start module";
		public static const STOPPED:String       = "stop module";
		public static const CONNECTED:String = "CONNECTED";
		public static const DISCONNECTED:String = "DISCONNECTED";
				
		public static const OPEN_WINDOW:String = 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String = 'CLOSE_WINDOW';	
		public static const ADD_WINDOW:String = 'ADD_WINDOW';
		public static const REMOVE_WINDOW:String = 'REMOVE_WINDOW';
				
		public static const MODULE_STARTED:String = 'MODULE_STARTED';

		public static const UNMUTE_ALL:String = "Unmute All Users";
		public static const MUTE_ALL:String = "Mute All Users";
		public static const EJECT_USER:String = "Eject User";
		public static const MUTE_USER:String = "Mute User";
		
		public static const USER_MUTE_NOTIFICATION:String = "USER_MUTE_NOTIFICATION";
		public static const USER_TALKING_NOTIFICATION:String = "USER_TALKING_NOTIFICATION";
		
		public static const USER_MUTE_EVENT:String = "USER_MUTE_EVENT";
		public static const USER_TALK_EVENT:String = "USER_TALK_EVENT";
		
		//EVENTS
		public static const MUTE_USER_EVENT:String = "MUTE_USER_EVENT";
		public static const EJECT_USER_COMMAND:String = "EJECT_USER_COMMAND";
		public static const MUTE_ALL_USERS_COMMAND:String = "MUTE_ALL_USERS_COMMAND";
		public static const MUTE_EVENT:String = "MUTE_EVENT";
			
		public static const EJECT_LISTENER_EVENT:String = "EJECT_LISTENER_EVENT";
		
		// THis is an event we send when the first listener joins the conference during playback.
		// We use this as a trigger to start playing the recorded audio. This is just a prototype.
		// Need to figure out how to play audio properly with synch. (ralam - march 26, 2009)
		public static const FIRST_LISTENER_JOINED_EVENT:String = "FIRST_LISTENER_JOINED_EVENT";
		public static const CONVERTED_RECORDED_MP3_EVENT:String = "CONVERTED_RECORDED_MP3_EVENT";
	}
}