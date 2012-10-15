package org.bigbluebutton.modules.chat.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.chat.model.CHAT;
  
  public class MessageReceiver implements IMessageListener
  {
    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void
    {
      switch (messageName) {
        case "ChatReceivePublicMessageCommand":
          handleChatReceivePublicMessageCommand(message);
          break;			
        case "ChatReceivePrivateMessageCommand":
          handleChatReceivePrivateMessageCommand(message);
          break;	
        default:
          //   LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleChatReceivePublicMessageCommand(message:Object):void {
      LogUtil.debug("Handling public chat message");
//      CHAT.getSessions().newPublicChatMessage(message);
    }
    
    private function handleChatReceivePrivateMessageCommand(message:Object):void {
      LogUtil.debug("Handling private chat message");
//      CHAT.getSessions().newPublicChatMessage(message);
    }
  }
}