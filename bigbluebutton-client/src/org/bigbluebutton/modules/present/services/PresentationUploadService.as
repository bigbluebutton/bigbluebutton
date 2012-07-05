package org.bigbluebutton.modules.present.services
{
    import flash.events.Event;
    import flash.events.HTTPStatusEvent;
    import flash.events.IEventDispatcher;
    import flash.events.IOErrorEvent;
    import flash.events.ProgressEvent;
    import flash.events.SecurityErrorEvent;
    import flash.net.FileReference;
    import flash.net.URLRequest;
    import flash.net.URLRequestMethod;
    import flash.net.URLVariables;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.UsersModel;
    import org.bigbluebutton.modules.present.events.UploadEvent;
    import org.bigbluebutton.modules.present.models.PresentationConfigModel;

    public class PresentationUploadService
    {       
//        public static const UPLOAD_PROGRESS:String = "UPLOAD_PROGRESS";
//        public static const UPLOAD_COMPLETED:String = "UPLOAD_COMPLETED";
//        public static const UPLOAD_IO_ERROR:String = "UPLOAD_IO_ERROR";
//        public static const UPLOAD_SECURITY_ERROR:String = "UPLOAD_SECURITY_ERROR";
        
        private var request:URLRequest = new URLRequest();
        private var sendVars:URLVariables = new URLVariables();
        
        private var _dispatcher:IEventDispatcher;
        
        public var users:UsersModel;
        public var config:PresentationConfigModel;
        
        public function PresentationUploadService(dispatcher:IEventDispatcher):void {
            _dispatcher = dispatcher;
        }
        
        /**
         * Uploads local files to a server 
         * @param file - The FileReference class of the file we wish to send
         * 
         */		
        public function upload(presentationName:String, file:FileReference):void {
            sendVars.presentation_name = presentationName;
            var fileToUpload:FileReference = new FileReference();
            fileToUpload = file;            
            fileToUpload.addEventListener(ProgressEvent.PROGRESS, onUploadProgress);
            fileToUpload.addEventListener(Event.COMPLETE, onUploadComplete);
            fileToUpload.addEventListener(IOErrorEvent.IO_ERROR, onUploadIoError);
            fileToUpload.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onUploadSecurityError);
            fileToUpload.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
            fileToUpload.addEventListener(Event.OPEN, openHandler);
            
            sendVars.conference = users.loggedInUser.conference;
            sendVars.room = users.loggedInUser.conference;
            request.url = config.presentationService + "/upload";
            request.data = sendVars;
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
            var e:UploadEvent = new UploadEvent(UploadEvent.UPLOAD_PROGRESS_UPDATE);
            e.percentageComplete = percentage;
            _dispatcher.dispatchEvent(e);
        }
        
        /**
         * Method is called when the upload has completed successfuly 
         * @param event
         * 
         */		
        private function onUploadComplete(event:Event):void {
            _dispatcher.dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_COMPLETE));
        }
        
        /**
         * Receives an ErrorEvent when an error occured during the upload 
         * @param event
         * 
         */
        private function onUploadIoError(event:IOErrorEvent):void {
            _dispatcher.dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_IO_ERROR));
            LogUtil.error("An error occured while uploading the file. " + event.toString()); 
        }
        
        /**
         * Method is called when a SecurityError is received 
         * @param event
         * 
         */		
        private function onUploadSecurityError(event:SecurityErrorEvent) : void {
            _dispatcher.dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_SECURITY_ERROR));
            LogUtil.error("A security error occured while trying to upload the presentation. " + event.toString());
        }
    }
}