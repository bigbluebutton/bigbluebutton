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
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	import flash.net.FileReference;
	
	public class UploadEvent extends Event
	{
		public static const OPEN_UPLOAD_WINDOW:String = "OPEN_UPLOAD_WINDOW";
		public static const CLOSE_UPLOAD_WINDOW:String = "CLOSE_UPLOAD_WINDOW";
		public static const CLEAR_PRESENTATION:String = "CLEAR_PRESENTATION";
		public static const CONVERT_SUCCESS:String = "CONVERT_SUCCESS";
		public static const CONVERT_UPDATE:String = "CONVERT_UPDATE";
		public static const CONVERT_ERROR:String = "CONVERT_ERROR";
		public static const START_UPLOAD:String = "START_UPLOAD";
		public static const UPLOAD_PROGRESS_UPDATE:String = "UPLOAD_PROGRESS_UPDATE";
		public static const UPLOAD_COMPLETE:String = "UPLOAD_COMPLETE";
		public static const UPLOAD_IO_ERROR:String = "UPLOAD_IO_ERROR";
		public static const UPLOAD_SECURITY_ERROR:String = "UPLOAD_SECURITY_ERROR";
		public static const UPDATE_PROGRESS:String = "UPDATE_PROGRESS";
		public static const THUMBNAILS_UPDATE:String = "THUMBNAILS_UPDATE";
		public static const PRESENTATION_READY:String = "PRESENTATION_READY";
		
		public var presentationName:String;
		public var data:Object;
		public var completedSlides:Number;
		public var totalSlides:Number;
		public var fileToUpload:FileReference;
		public var percentageComplete:Number;
		
		public function UploadEvent(type:String)
		{
			super(type, true, false);
		}

	}
}