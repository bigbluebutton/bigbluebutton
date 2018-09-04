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
package org.bigbluebutton.modules.present.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.FileReference;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.present.events.UploadCompletedEvent;
	import org.bigbluebutton.modules.present.events.UploadIoErrorEvent;
	import org.bigbluebutton.modules.present.events.UploadProgressEvent;
	import org.bigbluebutton.modules.present.events.UploadSecurityErrorEvent;
	
	public class FileUploadService {
		public static const ID:String = "FileUploadService";
		private static const LOGGER:ILogger = getClassLogger(FileUploadService);

		public static const UPLOAD_PROGRESS:String = "UPLOAD_PROGRESS";
		public static const UPLOAD_COMPLETED:String = "UPLOAD_COMPLETED";
		public static const UPLOAD_IO_ERROR:String = "UPLOAD_IO_ERROR";
		public static const UPLOAD_SECURITY_ERROR:String = "UPLOAD_SECURITY_ERROR";
		
		private var request:URLRequest = new URLRequest();
		private var sendVars:URLVariables = new URLVariables();
		
		private var dispatcher:Dispatcher;
		
		/**
		 * The default constructor 
		 * @param url - the address of the server
		 * @param room - a room in the server we're connecting to
		 * 
		 */		
		public function FileUploadService(url:String, conference:String, room:String):void {
			sendVars.conference = conference;
			sendVars.room = room;
			request.url = url;
			request.data = sendVars;
			dispatcher = new Dispatcher();
		}

		/**
		 * Uploads local files to a server 
		 * @param file - The FileReference class of the file we wish to send
		 * 
		 */		
		public function upload(podId: String, presentationName:String, file:FileReference, downloadable:Boolean):void {
			sendVars.presentation_name = presentationName;
			sendVars.is_downloadable = downloadable;
			sendVars.pod_id = podId;
			var fileToUpload : FileReference = new FileReference();
			fileToUpload = file;
			
			fileToUpload.addEventListener(ProgressEvent.PROGRESS, onUploadProgress);
			fileToUpload.addEventListener(Event.COMPLETE, onUploadComplete);
			fileToUpload.addEventListener(IOErrorEvent.IO_ERROR, onUploadIoError);
			fileToUpload.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onUploadSecurityError);
			fileToUpload.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			fileToUpload.addEventListener(Event.OPEN, openHandler);

			request.method = URLRequestMethod.POST;
			
			// "fileUpload" is the variable name of the uploaded file in the server
			fileToUpload.upload(request, "fileUpload", true);
		}
		
		private function httpStatusHandler(event:HTTPStatusEvent):void {
			// TO CLEANUP
			//_progressListener(PresentModuleConstants.UPLOAD_IO_ERROR_EVENT, "HTTP STATUS EVENT");
        	}

		private function openHandler(event:Event):void {
			// TO CLEANUP
			//_progressListener(PresentModuleConstants.UPLOAD_IO_ERROR_EVENT, "OPEN HANDLER");
        	}


		/**
		 * Receives an ProgressEvent which then updated the progress bar on the view 
		 * @param event - a ProgressEvent
		 * 
		 */		
		private function onUploadProgress(event:ProgressEvent) : void {
			var percentage:Number = Math.round((event.bytesLoaded / event.bytesTotal) * 100);
			var e:UploadProgressEvent = new UploadProgressEvent(percentage);
			dispatcher.dispatchEvent(e);
		}
		
		/**
		 * Method is called when the upload has completed successfuly 
		 * @param event
		 * 
		 */		
		private function onUploadComplete(event:Event):void {
			dispatcher.dispatchEvent(new UploadCompletedEvent());
		}

		/**
		 * Receives an ErrorEvent when an error occured during the upload 
		 * @param event
		 * 
		 */
		private function onUploadIoError(event:IOErrorEvent):void {
			if (event.errorID != 2038){ //upload works despite of this error.
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["presentation"];
                logData.logCode = "io_error_on_presentation_upload"; 
                LOGGER.error(JSON.stringify(logData));
            
				dispatcher.dispatchEvent(new UploadIoErrorEvent());
			}
			
		}
		
		/**
		 * Method is called when a SecurityError is received 
		 * @param event
		 * 
		 */		
		private function onUploadSecurityError(event:SecurityErrorEvent) : void {
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["presentation"];
						logData.logCode = "security_error_on_presentation_upload"; 
            LOGGER.error(JSON.stringify(logData));
            dispatcher.dispatchEvent(new UploadSecurityErrorEvent());
		}		
	}
}
