package org.bigbluebutton.modules.presentation
{
	import org.bigbluebutton.modules.presentation.model.PresentationApplication;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class PresentationNotificationListener extends Mediator implements IMediator
	{
		public static const NAME:String = "PresentationNotificationListener";
		
		public var receivedLoadCommand:Boolean = false;
		public var receivedUploadProgress:Boolean = false;
		public var receivedUploadComplete:Boolean = false;
		public var receivedIOError:Boolean = false;
		public var receivedSecurityError:Boolean = false;
		
		public var receivedLeaveEvent:Boolean = false;
		public var receivedJoinEvent:Boolean = false;
		public var receivedShareEvent:Boolean = false;
		public var receivedStartUpload:Boolean = false;

		
		public function PresentationNotificationListener()
		{
			super(NAME);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentationFacade.LOAD_COMMAND,
					PresentationFacade.UPLOAD_PROGRESS_EVENT,
					PresentationFacade.UPLOAD_COMPLETED_EVENT,
					PresentationFacade.UPLOAD_IO_ERROR_EVENT,
					PresentationFacade.UPLOAD_SECURITY_ERROR_EVENT,
					PresentationApplication.LEAVE,
					PresentationApplication.JOIN,
					PresentationApplication.SHARE,
					PresentationFacade.STARTUPLOADWINDOW
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PresentationFacade.LOAD_COMMAND:
					this.receivedLoadCommand = true;
					break;
				case PresentationFacade.UPLOAD_PROGRESS_EVENT:
					this.receivedUploadProgress = true;
					break;
				case PresentationFacade.UPLOAD_COMPLETED_EVENT:
					this.receivedUploadComplete = true;
					break;
				case PresentationFacade.UPLOAD_IO_ERROR_EVENT:
					this.receivedIOError = true;
					break;
				case PresentationFacade.UPLOAD_SECURITY_ERROR_EVENT:
					this.receivedSecurityError = true;
					break;
				case PresentationApplication.JOIN:
					this.receivedJoinEvent = true;
					break;
				case PresentationApplication.LEAVE:
					this.receivedLeaveEvent = true;
					break;
				case PresentationApplication.SHARE:
					this.receivedShareEvent = true;
					break;
				case PresentationFacade.STARTUPLOADWINDOW:
					this.receivedStartUpload = true;
					break;
			}
		}

	}
}