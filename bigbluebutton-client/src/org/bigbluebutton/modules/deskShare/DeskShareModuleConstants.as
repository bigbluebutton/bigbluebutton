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
package org.bigbluebutton.modules.deskShare
{
	/**
	 * The constants for this module 
	 * @author Snap
	 * 
	 */	
	public class DeskShareModuleConstants
	{
		public static const START:String       = "start module";
		public static const STOP:String       = "stop module";
		public static const CONNECTED:String = "connected to server";
		public static const DISCONNECTED:String = "disconnected from server";
		
		public static const OPEN_WINDOW:String = 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String = 'CLOSE_WINDOW';	
		public static const ADD_WINDOW:String = 'ADD_WINDOW';
		public static const REMOVE_WINDOW:String = 'REMOVE_WINDOW';	
		
		public static const START_VIEWING:String = "START_VIEWING";
		public static const STOP_VIEWING:String = "STOP_VIEWING";
		
		public static const SCALE:Number = 5;
		
		public static const GOT_WIDTH:String = "GOT_WIDTH";
		public static const GOT_HEIGHT:String = "GOT_HEIGHT";
		
		public static const APPLET_STARTED:String = "APPLET_STARTED";
		public static const START_DESKSHARE_EVENT:String = 'START_DESKSHARE_EVENT';
		public static const ADD_BUTTON:String = 'ADD_BUTTON';
		public static const REMOVE_BUTTON:String = 'REMOVE_BUTTON';
		public static const PARTICIPANT_IS_PRESENTER:String = 'PARTICIPANT_IS_PRESENTER';
	}
}