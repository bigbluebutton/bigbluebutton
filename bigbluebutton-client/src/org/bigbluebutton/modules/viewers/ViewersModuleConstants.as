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
package org.bigbluebutton.modules.viewers
{
	/**
	 * This class holds some of the constants relevant to this module 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ViewersModuleConstants
	{
		public static const START:String       					= "start module";
		public static const STOP:String       					= "stop module";
		public static const STARTED:String       				= "start module";
		public static const STOPPED:String       				= "stop module";
		public static const CONNECTED:String 					= "connected to server";
		public static const DISCONNECTED:String 				= "disconnected from server";
		
		public static const LOGIN_FAILED:String 				= 'LOGIN_FAILED';
		public static const LOGGED_IN:String 					= 'LOGGED_IN';
		public static const LOGGED_OUT:String 					= 'LOGGED_OUT';
		
		public static const OPEN_WINDOW:String 					= 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String 				= 'CLOSE_WINDOW';	
		public static const ADD_WINDOW:String 					= 'ADD_WINDOW';
		public static const REMOVE_WINDOW:String 				= 'REMOVE_WINDOW';
		
		public static const OPEN_JOIN_WINDOW:String 			= 'OPEN_JOIN_WINDOW';
		public static const CLOSE_JOIN_WINDOW:String 			= 'CLOSE_JOIN_WINDOW';
		
		public static const OPEN_VIEWERS_WINDOW:String 			= 'OPEN_VIEWERS_WINDOW';
		public static const CLOSE_VIEWERS_WINDOW:String 		= 'CLOSE_VIEWERS_WINDOW';
		
		public static const MODULE_STARTED:String 				= 'MODULE_STARTED';
		
		public static const OPEN_VIEW_CAMERA:String 			= "Open View Camera";
		
		public static const ASSIGN_PRESENTER:String 			= "ASSIGN_PRESENTER";
		public static const BECOME_VIEWER:String 				= "BECOME_VIEWER";
		
		public static const VIEWER_SELECTED_EVENT:String 		= "VIEWER_SELECTED_EVENT";
		public static const BECOME_VIEWER_EVENT:String 			= "BECOME_VIEWER_EVENT";
		public static const BECOME_PRESENTER_EVENT:String 		= "BECOME_PRESENTER_EVENT";
		public static const QUERY_PRESENTER_EVENT:String 		= "QUERY_PRESENTER_EVENT";
		public static const QUERY_PRESENTER_REPLY:String 		= "QUERY_PRESENTER_REPLY";
		
		public static const CONNECT_SUCCESS:String 				= "CONNECT_SUCCESS";
		public static const CONNECT_FAILED:String 				= "CONNECT_FAILED";
		public static const CONNECT_CLOSED:String 				= "CONNECT_CLOSED";
		public static const INVALID_APP:String 					= "INVALID_APP";
		public static const APP_SHUTDOWN:String 				= "APP_SHUTDOWN";
		public static const CONNECT_REJECTED:String 			= "CONNECT_REJECTED";
		public static const UNKNOWN_REASON:String 				= "UNKNOWN_REASON";
	}
}