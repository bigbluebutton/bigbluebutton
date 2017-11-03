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
	
	public class UploadEvent extends Event {
    public static const OPEN_EXTERNAL_UPLOAD_WINDOW:String = "OPEN_EXTERNAL_UPLOAD_WINDOW";
	public static const OPEN_UPLOAD_WINDOW:String = "OPEN_UPLOAD_WINDOW";
	public static const CLOSE_UPLOAD_WINDOW:String = "CLOSE_UPLOAD_WINDOW";
	public static const CLEAR_PRESENTATION:String = "CLEAR_PRESENTATION";
	public static const PRESENTATION_READY:String = "PRESENTATION_READY";
    
    public var presentationId: String;
		public var presentationName:String;
		public var data:Object;
		public var completedSlides:Number;
		public var totalSlides:Number;
		public var percentageComplete:Number;
		public var maximumSupportedNumberOfSlides:int;
		public var maxFileSize:Number;
		public var podId:String;
		
		public function UploadEvent(type:String, podId: String) {
			super(type, true, false);
			this.podId = podId;
		}

	}
}