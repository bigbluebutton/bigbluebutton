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
				
		public static const OPEN_WINDOW:String = 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String = 'CLOSE_WINDOW';
		public static const ADD_WINDOW:String = 'ADD_WINDOW';
		public static const REMOVE_WINDOW:String = 'REMOVE_WINDOW';
		public static const ADD_BUTTON:String = 'ADD_BUTTON';
		public static const REMOVE_BUTTON:String = 'REMOVE_BUTTON';
		
		public static const USER_LOGIN:String = 'USER_LOGIN';
		public static const USER_LOGGED_IN:String = 'USER_LOGGED_IN'
		public static const USER_LOGOUT:String = 'USER_LOGOUT';
		public static const USER_LOGGED_OUT:String = 'USER_LOGGED_OUT';
		
		// Set mode as PRESENTER, VIEWER, or PLAYBACK
		public static const MODE_SET:String = "MODE_SET";
		public static const ASSIGN_PRESENTER:String = "ASSIGN_PRESENTER";
		public static const BECOME_VIEWER:String = "BECOME_VIEWER";

		public static const STARTED_BROADCAST:String = 'STARTED_BROADCAST';
		public static const STOPPED_BROADCAST:String = 'STOPPED_BROADCAST';
		public static const VIEW_CAMERA:String = 'VIEW_CAMERA';
	}
}