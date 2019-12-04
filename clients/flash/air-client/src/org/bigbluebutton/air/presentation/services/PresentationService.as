package org.bigbluebutton.air.presentation.services {
	
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	
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
			presentMessageSender.conferenceParameters = conferenceParameters;
			presentMessageReceiver.userSession = userSession;
			userSession.mainConnection.addMessageListener(presentMessageReceiver);
		}
		
		public function getPresentationPods():void {
			presentMessageSender.getPresentationPods();
		}
		
		public function setCurrentPage(podId: String, presentationId: String, pageId: String):void {
			presentMessageSender.setCurrentPage(podId, presentationId, pageId);
		}
		
		public function move(podId: String, presentationId:String, pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void {
			presentMessageSender.move(podId, presentationId, pageId, xOffset, yOffset, widthRatio, heightRatio);
		}
		
		public function removePresentation(podId: String, presentationId:String):void {
			presentMessageSender.removePresentation(podId, presentationId);
		}
		
		public function setCurrentPresentation(podId: String, presentationId:String):void {
			presentMessageSender.setCurrentPresentation(podId, presentationId);
		}
	}
}
