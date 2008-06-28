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
package org.bigbluebutton.modules.presentation.view
{
	import flash.events.Event;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	
	import mx.controls.Alert;
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ProgressNotifier;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.bigbluebutton.modules.log.LogModuleFacade;

	/**
	 * This is the Mediator class for the FileUploadWindow component
	 * <p>
	 * This class extends the Mediator class of the pureMVC framework 
	 * @author dzgonjan
	 * 
	 */	
	public class FileUploadWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "FileUploadWindowMediator";
		
		public static const START_UPLOAD:String = "Start Upload";
		public static const CLOSE_UPLOAD_WINDOW:String = "Close File Upload Window";
		public static const SELECT_FILE:String = "Select File";
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		
		private var fileToUpload:FileReference = new FileReference();
		// Var to determine how to handle okCancelBtn click
		private var okState : Boolean = false;
		
		public var isListening:Boolean = true;
		
		/**
		 * The default constructor. Creates this mediator 
		 * @param view The GUI component which this class serves as a mediator for.
		 * 
		 */		
		public function FileUploadWindowMediator(view:FileUploadWindow)
		{
			super(NAME,view);
			fileUploadWindow.addEventListener(START_UPLOAD, startUpload);
			fileUploadWindow.addEventListener(CLOSE_UPLOAD_WINDOW, closeFileUploadWindow);
			fileUploadWindow.addEventListener(SELECT_FILE, selectFile);
		}
		
		/**
		 * Returns the FileUploadWindow GUI component that is registered to this Mediator object 
		 * @return 
		 * 
		 */		
		protected function get fileUploadWindow():FileUploadWindow{
			return viewComponent as FileUploadWindow;
		}
		
		/**
		 * Start the upload 
		 * @param e
		 * 
		 */		
		private function startUpload(e:Event):void{
			log.presentation("In startUpload()...")
			PresentationFacade.getInstance().presentationApp.uploadPresentation(fileToUpload);
			fileUploadWindow.progBarLbl.visible = true;
			fileUploadWindow.progressBar.visible = true;
			
			fileUploadWindow.okCancelBtn.visible = false;
			fileUploadWindow.selectBtn.enabled = false;
			fileUploadWindow.uploadBtn.enabled = false;
			fileUploadWindow.fileTxtInput.enabled = false;
		}
		
		/**
		 * Send a notification to close the upload window 
		 * @param e
		 * 
		 */		
		private function closeFileUploadWindow(e:Event) : void
		{
			closeWindow();
		}
		
		private function closeWindow():void{
			if (okState) {
				sendNotification(PresentationFacade.READY_EVENT);
			}
			enableControls();
			removeWindow();
		}
		
		public function removeWindow():void{
			PopUpManager.removePopUp(fileUploadWindow);
		}
		
		/**
		 * Called when a file is selected from the file system 
		 * @param e
		 * 
		 */		
		private function onSelectFile(e:Event):void
		{
			fileUploadWindow.fileTxtInput.text = fileToUpload.name;
			fileUploadWindow.uploadBtn.enabled = true;
		}
		
		/**
		 * Opens a file browser window 
		 * @param e
		 * 
		 */		
		private function selectFile(e:Event):void{
			fileToUpload.addEventListener(Event.SELECT, onSelectFile);	
			fileToUpload.browse([new FileFilter("PDF", "*.pdf")]);
		}
		
		/**
		 * Lists the notifications in which this class is interested. 
		 * @return An array of Strings representing notifications
		 * This class listens to:
		 * 	PresentationFacade.UPLOAD_COMPLETED_EVENT,
		 *	PresentationFacade.UPLOAD_PROGRESS_EVENT,
		 *	PresentationFacade.UPLOAD_IO_ERROR_EVENT,
		 *  PresentationFacade.UPLOAD_SECURITY_ERROR_EVENT,
		 *	PresentationFacade.CONVERT_PROGRESS_EVENT,
		 *	PresentationFacade.EXTRACT_PROGRESS_EVENT,
		 *	PresentationFacade.UPDATE_PROGRESS_EVENT,
		 *	PresentationFacade.CONVERT_SUCCESS_EVENT
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					PresentationFacade.UPLOAD_COMPLETED_EVENT,
					PresentationFacade.UPLOAD_PROGRESS_EVENT,
					PresentationFacade.UPLOAD_IO_ERROR_EVENT,
					PresentationFacade.UPLOAD_SECURITY_ERROR_EVENT,
					PresentationFacade.CONVERT_PROGRESS_EVENT,
					PresentationFacade.EXTRACT_PROGRESS_EVENT,
					PresentationFacade.UPDATE_PROGRESS_EVENT,
					PresentationFacade.CONVERT_SUCCESS_EVENT
					];
		}
		
		/**
		 * Method is executed when the class receives one of the notifications it is interested in 
		 * @param notification The received notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			//if (isListening == false) return;
			switch(notification.getName()){
				case PresentationFacade.UPLOAD_COMPLETED_EVENT:
					handleUploadCompleteEvent(notification);
					break;
				case PresentationFacade.UPLOAD_PROGRESS_EVENT:
					handleUploadProgressEvent(notification);
					break;
				case PresentationFacade.CONVERT_SUCCESS_EVENT:
					handleConvertSuccessEvent(notification);
					break;
				case PresentationFacade.UPLOAD_IO_ERROR_EVENT:
					handleUploadIOErrorEvent(notification);
					break;
				case PresentationFacade.UPLOAD_SECURITY_ERROR_EVENT:
					handleUploadSecurityErrorEvent(notification);
					break;
				case PresentationFacade.CONVERT_PROGRESS_EVENT:
					handleConvertProgressEvent(notification);
					break;
				case PresentationFacade.EXTRACT_PROGRESS_EVENT:
					handleExtractProgressEvent(notification);
					break;
				case PresentationFacade.UPDATE_PROGRESS_EVENT:
					handleUpdateProgressEvent(notification);
					break;
			}
		}
		
		/**
		 * Handles an UploadComplete Notification 
		 * @param note
		 * 
		 */		
		private function handleUploadCompleteEvent(note:INotification):void{
			fileUploadWindow.progressLbl.text = "Upload completed. Please wait while we convert the document."
			fileUploadWindow.progressBar.label = "Upload successful.";
			fileUploadWindow.progressBar.setProgress(0, 100);
			fileUploadWindow.progressBar.validateNow();

			fileUploadWindow.fileLbl.visible = false;
			fileUploadWindow.selectBtn.visible = false;
			fileUploadWindow.uploadBtn.visible = false;
			fileUploadWindow.fileTxtInput.visible = false;
		}
		
		/**
		 * Handles an UploadProgress Notification 
		 * @param note
		 * 
		 */		
		private function handleUploadProgressEvent(note:INotification):void{
			var progress:Number = note.getBody() as Number;
			
			fileUploadWindow.progressBar.label = progress + "% uploaded.";
			fileUploadWindow.progressBar.setProgress(progress, 100);
			fileUploadWindow.progressBar.validateNow();
		}
		
		/**
		 * Handles an UploadError Notification 
		 * @param note
		 * 
		 */		
		private function handleUploadIOErrorEvent(note:INotification):void{
			enableControls();
			Alert.show(note.getBody() as String, "IO Error When Uploading File");
		}
		
		/**
		 * Handles an UploadSecurityError notification 
		 * @param note
		 * 
		 */		
		private function handleUploadSecurityErrorEvent(note:INotification):void{
			enableControls();
			Alert.show(note.getBody() as String, "Security Error When Uploading File");
		}
		
		/**
		 * Handles a ProgressEvent Notification 
		 * @param note
		 * 
		 */		
		private function handleConvertProgressEvent(note:INotification):void{
			var convertEvt:ProgressNotifier = note.getBody() as ProgressNotifier;

			fileUploadWindow.progressBar.label = "Converting slide " + convertEvt.completedSlides + " of " 
					+ convertEvt.totalSlides + " slides.";
			fileUploadWindow.progressBar.setProgress(convertEvt.completedSlides, convertEvt.totalSlides);
			fileUploadWindow.progressBar.validateNow();
		}
		
		/**
		 * Handles an ExtractProgressEvent notification 
		 * @param note
		 * 
		 */		
		private function handleExtractProgressEvent(note:INotification):void{
			var extractEvt:ProgressNotifier = note.getBody() as ProgressNotifier;

			fileUploadWindow.progressBar.label = "Extracting slide " + extractEvt.completedSlides + " of " 
					+ extractEvt.totalSlides + " slides.";
			fileUploadWindow.progressBar.setProgress(extractEvt.completedSlides, extractEvt.totalSlides);
			fileUploadWindow.progressBar.validateNow();
		}
		
		/**
		 * Handles an UpdateProgressEvent notification 
		 * @param note
		 * 
		 */		
		private function handleUpdateProgressEvent(note:INotification):void{
			fileUploadWindow.progressLbl.text = note.getBody() as String;
		}
		
		/**
		 * Handles a convert success event notification 
		 * @param note
		 * 
		 */		
		private function handleConvertSuccessEvent(note:INotification):void{
			fileUploadWindow.okCancelBtn.label = "Ok";
			fileUploadWindow.okCancelBtn.visible = true;
			okState = true;
			closeWindow();
		}
		
		/**
		 * Enables control buttons 
		 * 
		 */		
		private function enableControls() : void
		{
			//First, remove this class from listening
			this.isListening = false;
			fileUploadWindow.okCancelBtn.visible = false;
			
			fileUploadWindow.selectBtn.enabled = true;
			fileUploadWindow.uploadBtn.enabled = true;
			fileUploadWindow.fileTxtInput.enabled = true;			
		}

	}
}