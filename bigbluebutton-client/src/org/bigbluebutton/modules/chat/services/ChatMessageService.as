package org.bigbluebutton.modules.chat.services
{
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.modules.chat.ChatConstants;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatMessageService
  {
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    public var dispatcher:IEventDispatcher;
    
    public function sendPublicMessageFromApi(message:Object):void
    {
      LogUtil.debug("sendPublicMessageFromApi");
      var msgVO:ChatMessageVO = new ChatMessageVO();
      msgVO.chatType = ChatConstants.PUBLIC_CHAT;
      msgVO.fromUserID = message.fromUserID;
      msgVO.fromUsername = message.fromUsername;
      msgVO.fromColor = message.fromColor;
      msgVO.fromLang = message.fromLang;
      msgVO.fromTime = message.fromTime;
      msgVO.fromTimezoneOffset = message.fromTimezoneOffset;

      msgVO.message = message.message;
      
      sendPublicMessage(msgVO);
    }    
    
    public function sendPrivateMessageFromApi(message:Object):void
    {
      var msgVO:ChatMessageVO = new ChatMessageVO();
      msgVO.chatType = ChatConstants.PUBLIC_CHAT;
      msgVO.fromUserID = message.fromUserID;
      msgVO.fromUsername = message.fromUsername;
      msgVO.fromColor = message.fromColor;
      msgVO.fromLang = message.fromLang;
      msgVO.fromTime = message.fromTime;
      msgVO.fromTimezoneOffset = message.fromTimezoneOffset;
      
      msgVO.toUserID = message.toUserID;
      msgVO.toUsername = message.toUsername;
      
      msgVO.message = message.message;
      
      sendPrivateMessage(msgVO);

    }
    
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
        msg.fromTime = new Date().getTime();
        msg.fromTimezoneOffset = new Date().getTimezoneOffset();
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