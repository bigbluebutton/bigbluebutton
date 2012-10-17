package org.bigbluebutton.modules.chat.services
{
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.modules.chat.ChatConstants;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatMessageService
  {
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    public var dispatcher:IEventDispatcher;
    
    public function sendPublicMessage(message:ChatMessageVO):void
    {
      sender.sendPublicMessage(message);
    }
    
    public function sendPrivateMessage(message:ChatMessageVO):void
    {
      sender.sendPrivateMessage(message);
    }
    
    public function getPublicChatMessages():void
    {
      sender.getPublicChatMessages();
    }
    
    private static const SPACE:String = " ";
    
    public function sendWelcomeMessage():void {
      var welcome:String = BBB.initUserConfigManager().getWelcomeMessage();
      if (welcome != "") {              
        var msg:ChatMessageVO = new ChatMessageVO();
        msg.chatType = ChatConstants.PUBLIC_CHAT;
        msg.fromUserID = SPACE;
        msg.fromUsername = SPACE;
        msg.fromColor = "0";
        msg.fromLang = "en";
        msg.fromTime = 0;
        msg.fromTimezoneOffset = 0;
        msg.toUserID = SPACE;
        msg.toUsername = SPACE;
        msg.message = welcome;
        
        var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
        pcEvent.message = msg;
        dispatcher.dispatchEvent(pcEvent);
      }	
    }
  }
}