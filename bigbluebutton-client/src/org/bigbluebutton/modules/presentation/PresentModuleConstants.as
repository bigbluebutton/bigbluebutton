package org.bigbluebutton.modules.presentation
{
	public class PresentModuleConstants
	{
		
		public static const PRESENTER_MODE:String = "PRESENTER_MODE";
		public static const VIEWER_MODE:String = "VIEWER_MODE";

		public static const START:String       = "start module";
		public static const STOP:String       = "stop module";
		public static const STARTED:String       = "started module";
		public static const STOPPED:String       = "stopped module";
		public static const CONNECTED:String = "connected to server";
		public static const DISCONNECTED:String = "disconnected from server";
				
		public static const STARTUPLOADWINDOW:String = "start upload";
		public static const START_PRESENTATION_APPLICATION:String = "start presentation app";
		
		public static const START_UPLOAD:String = "start upload";
		public static const UPDATE_PAGE:String = "update page";
		public static const ZOOM_SLIDE:String = "Zoom Slide";
		public static const MOVE_SLIDE:String = "Move Slide";
		public static const MAXIMIZE_PRESENTATION:String = "Maximize Presentation";
		public static const RESTORE_PRESENTATION:String = "Restore Presentation";
		
		// List of Commands
		public static const GOTO_SLIDE : String = "GOTO_SLIDE";	
		public static const DISPLAY_SLIDE : String = "DISPLAY_SLIDE";
		public static const JOIN_COMMAND : String = "PRESENTATION_JOIN_COMMAND";
		public static const LEAVE_COMMAND : String = "PRESENTATION_LEAVE_COMMAND";
		public static const CLEAR_COMMAND : String = "PRESENTATION_CLEAR_COMMAND";
		public static const ASSIGN_COMMAND : String = "PRESENTATION_ASSIGN_COMMAND";
		public static const LOAD_COMMAND : String = "PRESENTATION_LOAD_COMMAND";
		public static const START_SHARE : String = "START_SHARE";
		public static const STOP_SHARE_COMMAND : String = "PRESENTATION_STOP_SHARE_COMMAND";
		public static const UPLOAD_COMMAND : String = "PRESENTATION_UPLOAD_COMMAND";
		public static const SYNC_ZOOM : String = "SYNC_ZOOM";
		
		// List of Events
		public static const READY_EVENT : String = "PRESENTATION_READY_EVENT";
		public static const CLEAR_EVENT : String = "PRESENTATION_CLEAR_EVENT";
		public static const VIEW_EVENT : String = "PRESENTATION_VIEW_EVENT";

		public static const	UPLOAD_COMPLETED_EVENT:String = "UPLOAD_COMPLETED_EVENT";
		public static const	UPLOAD_PROGRESS_EVENT:String = "UPLOAD_PROGRESS_EVENT";
		public static const	UPLOAD_IO_ERROR_EVENT:String = "UPLOAD_IO_ERROR_EVENT";
		public static const	UPLOAD_SECURITY_ERROR_EVENT:String = "UPLOAD_SECURITY_ERROR_EVENT";
		public static const CONVERT_SUCCESS_EVENT:String = "CONVERT_SUCCESS_EVENT";
		public static const UPDATE_PROGRESS_EVENT:String = "UPDATE_PROGRESS_EVENT";
		public static const EXTRACT_PROGRESS_EVENT:String = "EXTRACT_PROGRESS_EVENT";
		public static const CONVERT_PROGRESS_EVENT:String = "CONVERT_PROGRESS_EVENT";

		public static const OPEN_PRESENT_WINDOW:String = 'OPEN_PRESENT_WINDOW';
		public static const CLOSE_PRESENT_WINDOW:String = 'CLOSE_PRESENT_WINDOW';
		public static const OPEN_WINDOW:String = 'OPEN_WINDOW';
		public static const CLOSE_WINDOW:String = 'CLOSE_WINDOW';	
		public static const ADD_WINDOW:String = 'ADD_WINDOW';
		public static const REMOVE_WINDOW:String = 'REMOVE_WINDOW';
		public static const REMOVE_UPLOAD_WINDOW:String = "REMOVE_UPLOAD_WINDOW";
		
		public static const PRESENTER_NAME:String = 'PRESENTER_NAME';
		public static const PRESENTATION_LOADED:String = 'PRESENTATION_LOADED';
		public static const SLIDE_LOADED:String = "SLIDE_LOADED";
		public static const THUMBNAIL_WINDOW_CLOSE:String = "THUMBNAIL_WINDOW_CLOSE";
	}
}