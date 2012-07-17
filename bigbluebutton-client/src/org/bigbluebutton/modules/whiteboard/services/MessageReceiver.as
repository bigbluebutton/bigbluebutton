package org.bigbluebutton.modules.whiteboard.services
{
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

	public class MessageReceiver implements IMessageListener
	{
		public var whiteboradModel:WhiteboardModel;
		
		public function MessageReceiver()
		{
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
				default:
					LogUtil.warn("Cannot handle message [" + messageName + "]");
			}
			
		}
		
		private function handleChangePageCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Change Page Command [ " + message.pageNum + ", " + message.numAnnotations + "]");
		}
		
		private function handleClearCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Clear Command ");
//			dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.BOARD_CLEARED));
		}
		
		private function handleUndoCommand(message:Object):void {
			LogUtil.debug("Handle Whiteboard Undo Command ");
			//            dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.SHAPE_UNDONE));
		}
		
		private function handleEnableWhiteboardCommand(message:Object):void {
			//if (result as Boolean) modifyEnabledCallback(true);
			LogUtil.debug("Handle Whiteboard Enabled Command " + message.enabled);
		}
		
		private function handleNewAnnotationCommand(message:Object):void {
			LogUtil.debug("Handle new annotation[" + message.type + ", " + message.id + ", " + message.status + "]");
			switch (message.type) {
				case "text":
					//					annotation["type"] = "text";
					//					annotation["id"] = tobj.getGraphicID();
					//					annotation["status"] = tobj.status;  
					//					annotation["text"] = tobj.text;
					//					annotation["fontColor"] = tobj.textColor;
					//					annotation["backgroundColor"] = tobj.backgroundColor;
					//					annotation["background"] = tobj.background;
					//					annotation["x"] = tobj.x;
					//					annotation["y"] = tobj.y;
					//					annotation["fontSize"] = tobj.textSize;
					//					addText(message.type, message.text, message.fontColor, message.backgroundColor, 
					break;
				
			}
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