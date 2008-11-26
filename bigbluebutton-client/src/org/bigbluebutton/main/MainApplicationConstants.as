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
package org.bigbluebutton.main
{   
	/**
	 * Contains the constants being used in the application piping 
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	public class MainApplicationConstants
	{
		public static const FROM_MAIN:String = 'FROM_MAIN_APP';
		public static const TO_MAIN:String = 'TO_MAIN_APP';

		public static const ADD_BUTTON:String = 'ADD_BUTTON';
		public static const REMOVE_BUTTON:String = 'REMOVE_BUTTON';
		public static const ADD_WINDOW_MSG:String = 'ADD_WINDOW_MSG';
		public static const REMOVE_WINDOW_MSG:String = 'REMOVE_WINDOW_MSG';
		public static const OPEN_WINDOW:String = 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String = 'CLOSE_WINDOW';
				
		public static const LOGIN_COMPLETE:String = "LOGIN_COMPLETE";
		public static const CONNECTION_LOST:String = "CONNECTION_LOST"
		
		public static const LOADED_MODULE:String = 'LOADED_MODULE';
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const MODULES_LOAD:String = 'load all modules';
		public static const MODULES_LOADED:String = 'all modules loaded';
		public static const MODULES_START:String = 'start all modules';
		public static const MODULES_STARTED:String = 'modules have started';
		public static const MODULE_STOP:String = 'MODULE_STOP';
		public static const MODULE_START:String = 'MODULE_START';		
		public static const MODULE_STOPPED:String = 'MODULE_STOPPED';
		public static const MODULE_STARTED:String = 'MODULE_STARTED'
		public static const RESTART_MODULE:String = "RESTART_MODULE";
		
		public static const MODULE_LOAD:String = 'load the module';
		public static const MODULE_LOADED:String = 'module has loaded';
		public static const MODULE_UNLOAD:String = 'unload the module';
		public static const APP_START:String = 'start main application';
		public static const APP_STARTED:String = 'app has started';
		public static const APP_MODEL_INITIALIZE:String = 'initialize app model';
		public static const APP_MODEL_INITIALIZED:String = 'app model initialized';
		public static const APP_VIEW_INITIALIZED:String = 'app view initialized';
		public static const USER_LOGIN:String = 'user logging in';
		public static const USER_LOGGED_IN:String = 'user logged in'
		public static const USER_LOGOUT:String = 'user logging out';
		public static const USER_LOGGED_OUT:String = 'user logged out';
		
		public static const LOGOUT_EVENT:String = "LOGOUT_EVENT"; 
		public static const LOGOUT:String = "LOGOUT";		
	}
}