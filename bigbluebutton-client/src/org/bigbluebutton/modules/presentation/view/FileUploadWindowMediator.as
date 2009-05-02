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
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ProgressNotifier;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.FileUploadWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	import org.bigbluebutton.modules.presentation.view.event.*;
	

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
		//public static const SHOW_PRESENTATION:String = "Show Presentation";
		public static const CLOSE_UPLOAD_WINDOW:String = "Close File Upload Window";
		public static const TERMINATE_UPLOAD_WINDOW:String = "Terminate File Upload Window";
		public static const SELECT_FILE:String = "Select File";
		
		private var fileToUpload:FileReference = new FileReference();
		
		private var _fileWin:FileUploadWindow;
		
		// Var to determine how to handle okCancelBtn click
		private var okState : Boolean = false;

		// Var who holds infomation(message, presentationName from red5-server)
		private var info : Object;
		
		public var isListening:Boolean = true;
		
		/**
		 * The default constructor. Creates this mediator 
		 * @param view The GUI component which this class serves as a mediator for.
		 * 
		 */		
		public function FileUploadWindowMediator(fileWin:FileUploadWindow)
		{
			super(NAME, fileWin);
			_fileWin = fileWin;
			_fileWin.addEventListener(START_UPLOAD, startUpload);
			_fileWin.addEventListener("SHOW_PRESENTATION_EVENT", showPresentation);
			_fileWin.addEventListener(CLOSE_UPLOAD_WINDOW, closeFileUploadWindow);
			_fileWin.addEventListener(TERMINATE_UPLOAD_WINDOW, terminateFileUploadWindow);
			_fileWin.addEventListener(SELECT_FILE, selectFile);
		}
		
		/**
		 * Start the upload 
		 * @param e
		 * 
		 */		
		private function startUpload(e:Event):void{
			LogUtil.debug("In startUpload()...")
			var proxy:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
	
			var presentationName:String = fileToUpload.name
			var filenamePattern:RegExp = /(.+)(\.pdf)/i;
			// Get the first match which should be the filename without the extension.
			presentationName = presentationName.replace(filenamePattern, "$1")
			// Replace any character other than a word character (A-Z, a-z, 0-9, or _).
			presentationName = presentationName.replace(/[^0-9a-zA-Z_\.]/g, "-");
			proxy.uploadPresentation(presentationName, fileToUpload);
			
			_fileWin.progBarLbl.visible = true;
			_fileWin.progressBar.visible = true;
			
			_fileWin.okCancelBtn.visible = false;
			_fileWin.selectBtn.enabled = false;
			_fileWin.uploadBtn.enabled = false;
			_fileWin.fileTxtInput.enabled = false;
			
			_fileWin.presentationNamesLb.visible = false;
			_fileWin.presentationNamesCombobox.visible = false;
			_fileWin.deleteBtn.visible = false;
			_fileWin.showBtn.visible = false;
		}

		/**
		 * show a Presentation 
		 * @param e
		 * 
		 */		
		private function showPresentation(e:ShowPresentationEvent):void
		{
			LogUtil.debug("FileUploadWindowMediator::showPresentation()...:" + e.presentationName)

			var proxy:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			proxy.loadPresentation(e.presentationName);
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

		private function terminateFileUploadWindow(e:Event) : void
		{
			sendNotification(PresentModuleConstants.REMOVE_UPLOAD_WINDOW);
		}
		
		private function closeWindow():void{
			if (okState) {
				sendNotification(PresentModuleConstants.READY_EVENT, info);
			} else{
				sendNotification(PresentModuleConstants.REMOVE_UPLOAD_WINDOW);
			}
			enableControls();
		}
				
		/**
		 * Called when a file is selected from the file system 
		 * @param e
		 * 
		 */		
		private function onSelectFile(e:Event):void
		{
			_fileWin.fileTxtInput.text = fileToUpload.name;
			_fileWin.uploadBtn.enabled = true;
		}
		
	
		private function selectFile(e:Event):void{
			fileToUpload.addEventListener(Event.SELECT, onSelectFile);	
			fileToUpload.browse([new FileFilter("PDF", "*.pdf")]);
		}
			
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.UPLOAD_COMPLETED_EVENT,
					PresentModuleConstants.UPLOAD_PROGRESS_EVENT,
					PresentModuleConstants.UPLOAD_IO_ERROR_EVENT,
					PresentModuleConstants.UPLOAD_SECURITY_ERROR_EVENT,
					PresentModuleConstants.CONVERT_PROGRESS_EVENT,
					PresentModuleConstants.EXTRACT_PROGRESS_EVENT,
					PresentModuleConstants.UPDATE_PROGRESS_EVENT,
					PresentModuleConstants.CONVERT_SUCCESS_EVENT
					];
		}
		
	
		override public function handleNotification(notification:INotification):void{
			//if (isListening == false) return;
			switch(notification.getName()){
				case PresentModuleConstants.UPLOAD_COMPLETED_EVENT:
					handleUploadCompleteEvent(notification);
					break;
				case PresentModuleConstants.UPLOAD_PROGRESS_EVENT:
					handleUploadProgressEvent(notification);
					break;
				case PresentModuleConstants.CONVERT_SUCCESS_EVENT:
					handleConvertSuccessEvent(notification);
					break;
				case PresentModuleConstants.UPLOAD_IO_ERROR_EVENT:
					handleUploadIOErrorEvent(notification);
					break;
				case PresentModuleConstants.UPLOAD_SECURITY_ERROR_EVENT:
					handleUploadSecurityErrorEvent(notification);
					break;
				case PresentModuleConstants.CONVERT_PROGRESS_EVENT:
					handleConvertProgressEvent(notification);
					break;
				case PresentModuleConstants.EXTRACT_PROGRESS_EVENT:
					handleExtractProgressEvent(notification);
					break;
				case PresentModuleConstants.UPDATE_PROGRESS_EVENT:
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
			_fileWin.progressLbl.text = "Upload completed. Please wait while we convert the document."
			_fileWin.progressBar.label = "Upload successful.";
			_fileWin.progressBar.setProgress(0, 100);
			_fileWin.progressBar.validateNow();
			_fileWin.progressLbl.validateNow();

			_fileWin.fileLbl.visible = false;
			_fileWin.selectBtn.visible = false;
			_fileWin.uploadBtn.visible = false;
			_fileWin.fileTxtInput.visible = false;
		}
		
		/**
		 * Handles an UploadProgress Notification 
		 * @param note
		 * 
		 */		
		private function handleUploadProgressEvent(note:INotification):void{
			var progress:Number = note.getBody() as Number;
			LogUtil.debug("FileUpload " + progress + "% uploaded.");
			_fileWin.progressLbl.text = progress + "% uploaded.";
			_fileWin.progressBar.label = progress + "% uploaded.";
			_fileWin.progressBar.setProgress(progress, 100);
			_fileWin.progressBar.validateNow();
			_fileWin.progressLbl.validateNow();
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
			_fileWin.progressLbl.text = "Converting slide " + convertEvt.completedSlides + " of " + convertEvt.totalSlides + " slides.";
			_fileWin.progressBar.label = "Converting slide " + convertEvt.completedSlides + " of " 
					+ convertEvt.totalSlides + " slides.";
			_fileWin.progressBar.setProgress(convertEvt.completedSlides, convertEvt.totalSlides);
			_fileWin.progressBar.validateNow();
			_fileWin.progressLbl.validateNow();
		}
		
		/**
		 * Handles an ExtractProgressEvent notification 
		 * @param note
		 * 
		 */		
		private function handleExtractProgressEvent(note:INotification):void{
			var extractEvt:ProgressNotifier = note.getBody() as ProgressNotifier;
			_fileWin.progressLbl.text = "Extracting slide " + extractEvt.completedSlides + " of " + extractEvt.totalSlides + " slides.";
			_fileWin.progressBar.label = "Extracting slide " + extractEvt.completedSlides + " of " 
					+ extractEvt.totalSlides + " slides.";
			_fileWin.progressBar.setProgress(extractEvt.completedSlides, extractEvt.totalSlides);
			_fileWin.progressBar.validateNow();
			_fileWin.progressLbl.validateNow();
		}
		
		/**
		 * Handles an UpdateProgressEvent notification 
		 * @param note
		 * 
		 */		
		private function handleUpdateProgressEvent(note:INotification):void{
			_fileWin.progressLbl.text = note.getBody() as String;
			_fileWin.progressLbl.validateNow();
		}
		
		/**
		 * Handles a convert success event notification 
		 * @param note
		 * 
		 */		
		private function handleConvertSuccessEvent(note:INotification):void
		{
			_fileWin.okCancelBtn.label = "Ok";
			_fileWin.okCancelBtn.visible = true;
			okState = true;
			info = note.getBody();
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
			_fileWin.okCancelBtn.visible = false;
			
			_fileWin.selectBtn.enabled = true;
			_fileWin.uploadBtn.enabled = true;
			_fileWin.fileTxtInput.enabled = true;			
		}

	}
}