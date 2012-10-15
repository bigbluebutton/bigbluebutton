package org.bigbluebutton.modules.chat.services
{
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatMessageService
  {
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    
    public function sendPublicMessage(message:ChatMessageVO):void
    {
      sender.sendPublicMessage(message);
    }
    
    public function sendPrivateMessage(message:ChatMessageVO):void
    {
      sender.sendPrivateMessage(message);
    }
    
    public function getPublicMessages():void
    {
      sender.getPublicMessages();
    }
  }
}