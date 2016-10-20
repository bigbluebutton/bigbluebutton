package org.bigbluebutton.lib.whiteboard.services {
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class WhiteboardService implements IWhiteboardService {
		
		[Inject]
		public var userSession:IUserSession;
		
		private var whiteboardMessageSender:WhiteboardMessageSender;
		
		private var whiteboardMessageReceiver:WhiteboardMessageReceiver;
		
		public function WhiteboardService() {
		}
		
		public function setupMessageSenderReceiver():void {
			whiteboardMessageSender = new WhiteboardMessageSender(userSession);
			whiteboardMessageReceiver = new WhiteboardMessageReceiver(userSession);
			userSession.mainConnection.addMessageListener(whiteboardMessageReceiver);
		}
		
		public function getAnnotationHistory(presentationID:String, pageNumber:int):void {
			whiteboardMessageSender.requestAnnotationHistory(presentationID + "/" + pageNumber);
		}
		
		public function changePage(pageNum:Number):void {
			pageNum += 1;
			//if (isPresenter) {
			whiteboardMessageSender.changePage(pageNum);
			//}
		}
		
		public function undoGraphic():void {
			whiteboardMessageSender.undoGraphic()
		}
		
		public function clearBoard():void {
			whiteboardMessageSender.clearBoard();
		}
		
		public function sendText():void {
			whiteboardMessageSender.sendText();
		}
		
		public function sendShape():void {
			whiteboardMessageSender.sendShape();
		}
		
		public function setActivePresentation():void {
			//if (isPresenter) {
			whiteboardMessageSender.setActivePresentation();
			//}
		}
	}
}
