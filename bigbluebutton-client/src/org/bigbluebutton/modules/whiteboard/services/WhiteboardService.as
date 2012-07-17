package org.bigbluebutton.modules.whiteboard.services
{
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;

	public class WhiteboardService
	{
		public var sender:MessageSender;
		public var receiver:MessageReceiver;
		
		public function WhiteboardService()
		{
		}
		
		public function modifyEnabled(e:WhiteboardPresenterEvent):void {
			sender.modifyEnabled(e);
		}
		

		public function toggleGrid():void{
			sender.toggleGrid();
		}
		

		public function undoGraphic():void{
			sender.undoGraphic()
		}
		
	
		public function clearBoard():void{
			sender.clearBoard();
		}
		
	
		public function sendText(e:WhiteboardDrawEvent):void{
			sender.sendText(e);
		}		
		
	
		public function sendShape(e:WhiteboardDrawEvent):void {
			sender.sendShape(e);
		}
		
		public function checkIsWhiteboardOn():void {
			sender.checkIsWhiteboardOn();
		}
		
		public function setActivePresentation(e:PresentationEvent):void{
			sender.setActivePresentation(e);
		}
		
		
	}
}