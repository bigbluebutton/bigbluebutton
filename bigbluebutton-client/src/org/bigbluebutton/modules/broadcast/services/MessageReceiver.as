package org.bigbluebutton.modules.broadcast.services
{
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  
  public class MessageReceiver implements IMessageListener
  {
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void
    {
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
          //          LogUtil.warn("Cannot handle message [" + messageName + "]");
    }
  }
}