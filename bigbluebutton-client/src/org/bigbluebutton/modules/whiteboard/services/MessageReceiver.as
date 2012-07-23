package org.bigbluebutton.modules.whiteboard.services
{
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObjectFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

	public class MessageReceiver implements IMessageListener
	{
		public var whiteboardModel:WhiteboardModel;
		private var drawFactory:DrawObjectFactory;

		public function MessageReceiver()
		{
			LogUtil.debug("**** MessageReceiver INITED");
			drawFactory = new DrawObjectFactory();
			BBB.initConnectionManager().addMessageListener(this);
		}
		
		public function onMessage(messageName:String, message:Object):void {
			LogUtil.debug("WB: received message " + messageName);
			
			switch (messageName) {
				case "WhiteboardRequestAnnotationHistoryReply":
					handleRequestAnnotationHistoryReply(message);
					break;
				case "WhiteboardIsWhiteboardEnabledReply":
					handleIsWhiteboardEnabledReply(message);
					break;
				case "WhiteboardEnableWhiteboardCommand":
					handleEnableWhiteboardCommand(message);
					break;    
				case "WhiteboardNewAnnotationCommand":
					handleNewAnnotationCommand(message);
					break;  
				case "WhiteboardClearCommand":
					handleClearCommand(message);
					break;  
				case "WhiteboardUndoCommand":
					handleUndoCommand(message);
					break;  
				case "WhiteboardChangePageCommand":
					handleChangePageCommand(message);
					break; 
				case "WhiteboardChangePresentationCommand":
					handleChangePresentationCommand(message);
					break; 				
				default:
					LogUtil.warn("Cannot handle message [" + messageName + "]");
			}
			
		}

		private function handleChangePresentationCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Change Presentation Command [ " + message.presentationID + ", " + message.numberOfPages + "]");
			whiteboardModel.changePresentation(message.presentationID, message.numberOfPages);
		}
		
		private function handleChangePageCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Change Page Command [ " + message.pageNum + ", " + message.numAnnotations + "]");
			whiteboardModel.changePage(message.pageNum, message.numAnnotations);
		}
		
		private function handleClearCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Clear Command ");
//			dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.BOARD_CLEARED));
			whiteboardModel.clear();
		}
		
		private function handleUndoCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Undo Command ");
			whiteboardModel.undo();
			//            dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.SHAPE_UNDONE));
		}
		
		private function handleEnableWhiteboardCommand(message:Object):void {
			//if (result as Boolean) modifyEnabledCallback(true);
			LogUtil.debug("Handle Whiteboard Enabled Command " + message.enabled);
			whiteboardModel.enable(message.enabled);
		}
		
		private function handleNewAnnotationCommand(message:Object):void {
			LogUtil.debug("Handle new annotation[" + message.type + ", " + message.id + ", " + message.status + "]");
			switch (message.type) {
				case "text":
					addText(message);
					break;
				
			}
		}
		
		private function addText(message:Object):void {
			LogUtil.debug("Rx add text **** with ID of " + message.id + " " + message.x + "," + message.y);
			var t:TextObject = new TextObject(message.text, message.fontColor, message.backgroundColor, message.background, message.x, message.y, message.fontSize);	
			t.setGraphicID(message.id);
			t.status = message.status;
            whiteboardModel.addAnnotation(t);
		}
		
		/**
		 * Adds a shape to the ValueObject, then triggers an update event
		 * @param array The array representation of a shape
		 * 
		 */		
		private function addSegment(message:Object):void {
			//graphicType:String, array:Array, type:String, color:uint, thickness:uint, 
			//					   fill:Boolean, fillColor:uint, transparent:Boolean, id:String, status:String, recvdShapes:Boolean = false):void{
			LogUtil.debug("Rx add segment **** with ID of " + message.id + " " + message.type
							+ " and " + message.color + " " + message.thickness + " " + message.fill + " " + message.transparency);
			var d:DrawObject = drawFactory.makeDrawObject(message.type, message.points, message.color, message.thickness, message.fill, message.fillColor, message.transparency);
			
			d.setGraphicID(message.id);
			d.status = message.status;
			
		}
		
		private function handleIsWhiteboardEnabledReply(message:Object):void {
			//if (result as Boolean) modifyEnabledCallback(true);
			LogUtil.debug("Whiteboard Enabled? " + message.enabled);
		}
		
		private function handleRequestAnnotationHistoryReply(message:Object):void {
			if (message.count == 0) {
				LogUtil.debug("No annotations.");
			} else {
				LogUtil.debug("Number of annotations in history = " + message.count);
			}
		}
	}
}