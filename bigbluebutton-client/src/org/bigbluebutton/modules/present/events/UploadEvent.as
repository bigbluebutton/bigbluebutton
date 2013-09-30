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
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	import flash.net.FileReference;
	
	public class UploadEvent extends Event {
    public static const OPEN_EXTERNAL_UPLOAD_WINDOW:String = "OPEN_EXTERNAL_UPLOAD_WINDOW";
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

		public static const OFFICE_DOC_CONVERSION_SUCCESS:String = "OFFICE_DOC_CONVERSION_SUCCESS";
    	public static const OFFICE_DOC_CONVERSION_FAILED:String = "OFFICE_DOC_CONVERSION_FAILED";
    	public static const SUPPORTED_DOCUMENT:String = "SUPPORTED_DOCUMENT";
    	public static const UNSUPPORTED_DOCUMENT:String = "UNSUPPORTED_DOCUMENT";
    	public static const PAGE_COUNT_FAILED:String = "PAGE_COUNT_FAILED";
    	public static const PAGE_COUNT_EXCEEDED:String = "PAGE_COUNT_EXCEEDED";
    			
		public var presentationName:String;
		public var data:Object;
		public var completedSlides:Number;
		public var totalSlides:Number;
		public var fileToUpload:FileReference;
		public var percentageComplete:Number;
		public var maximumSupportedNumberOfSlides:int;
		public var maxFileSize:Number;
		
		public function UploadEvent(type:String) {
			super(type, true, false);
		}

	}
}