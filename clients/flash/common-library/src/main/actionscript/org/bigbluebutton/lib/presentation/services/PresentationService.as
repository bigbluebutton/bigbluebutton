package org.bigbluebutton.lib.presentation.services {
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class PresentationService implements IPresentationService {
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var userSession:IUserSession;
		
		public var presentMessageSender:PresentMessageSender;
		
		public var presentMessageReceiver:PresentMessageReceiver;
		
		public function PresentationService() {
			presentMessageSender = new PresentMessageSender;
			presentMessageReceiver = new PresentMessageReceiver;
		}
		
		public function setupMessageSenderReceiver():void {
			presentMessageSender.userSession = userSession;
			presentMessageReceiver.userSession = userSession;
			userSession.mainConnection.addMessageListener(presentMessageReceiver);
		}
		
		public function getPresentationInfo():void {
			presentMessageSender.getPresentationInfo();
		}
		
		public function gotoSlide(id:String):void {
			presentMessageSender.gotoSlide(id);
		}
		
		public function move(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void {
			presentMessageSender.move(xOffset, yOffset, widthRatio, heightRatio);
		}
		
		public function removePresentation(name:String):void {
			presentMessageSender.removePresentation(name);
		}
		
		public function sendCursorUpdate(xPercent:Number, yPercent:Number):void {
			presentMessageSender.sendCursorUpdate(xPercent, yPercent);
		}
		
		public function sharePresentation(share:Boolean, presentationName:String):void {
			presentMessageSender.sharePresentation(share, presentationName);
		}
	}
}
