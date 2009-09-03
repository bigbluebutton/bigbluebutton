/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.common.messaging
{
	public class EndpointMessageConstants
	{	
		public static const MODULE_READY:String = 'MODULE_READY';	
		public static const MODULE_STARTED:String = 'MODULE_STARTED';
		public static const MODULE_STOPPED:String = 'MODULE_STOPPED';
		
		public static const CONF_INFO_QUERY:String = 'CONF_INFO_QUERY';
		public static const CONF_INFO_QUERY_REPLY:String = 'CONF_INFO_QUERY_REPLY';

		public static const FROM_MAIN_APP:String = 'FROM_MAIN_APP';
		public static const TO_MAIN_APP:String = 'TO_MAIN_APP';

		public static const FROM_LISTENERS_MODULE:String = 'FROM_LISTENERS_MODULE';
		public static const TO_LISTENERS_MODULE:String = 'TO_LISTENERS_MODULE';
		
		public static const FROM_VIDEO_MODULE:String = 'FROM_VIDEO_MODULE';
		public static const TO_VIDEO_MODULE:String = 'TO_VIDEO_MODULE';
						
		public static const FROM_CHAT_MODULE:String = 'FROM_CHAT_MODULE';
		public static const TO_CHAT_MODULE:String = 'TO_CHAT_MODULE';
		
		public static const FROM_VIEWERS_MODULE:String = 'FROM_VIEWERS_MODULE';
		public static const TO_VIEWERS_MODULE:String = 'TO_VIEWERS_MODULE';

		public static const TO_PRESENTATION_MODULE:String = "TO_PRESENTATION_MODULE";
		public static const FROM_PRESENTATION_MODULE:String = "FROM_PRESENTATION_MODULE";
		
		public static const TO_DESK_SHARE_MODULE:String = "TO_DESK_SHARE_MODULE";
		public static const FROM_DESK_SHARE_MODULE:String = "FROM_DESK_SHARE_MODULE";
				
		public static const OPEN_WINDOW:String = 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String = 'CLOSE_WINDOW';
		public static const ADD_WINDOW:String = 'ADD_WINDOW';
		public static const REMOVE_WINDOW:String = 'REMOVE_WINDOW';
		public static const ADD_BUTTON:String = 'ADD_BUTTON';
		public static const REMOVE_BUTTON:String = 'REMOVE_BUTTON';
		
		public static const LOGIN_SUCCESS:String = 'LOGIN_SUCCESS';
		public static const LOGIN_FAILED:String = 'LOGIN_FAILED';
		public static const USER_JOINED:String = 'USER_JOINED';
		public static const JOIN_FAILED:String = 'JOIN_FAILED';
		public static const USER_LOGGED_IN:String = 'USER_LOGGED_IN'
		public static const USER_LOGOUT:String = 'USER_LOGOUT';
		public static const USER_LOGGED_OUT:String = 'USER_LOGGED_OUT';
		
		// Set mode as PRESENTER, VIEWER, or PLAYBACK
		public static const MODE_SET:String = "MODE_SET";
		public static const ASSIGN_PRESENTER:String = "ASSIGN_PRESENTER";
		public static const BECOME_VIEWER:String = "BECOME_VIEWER";

		public static const STARTED_BROADCAST:String = 'STARTED_BROADCAST';
		public static const STOPPED_BROADCAST:String = 'STOPPED_BROADCAST';
		
		public static const NEW_PARTICIPANT:String = 'NEW_PARTICIPANT';
		public static const PARTICIPANT_LEFT:String = 'PARTICIPANT_LEFT';
		
		public static const PARTICIPANT_IS_PRESENTER:String = 'PARTICIPANT_IS_PRESENTER';
	}
}