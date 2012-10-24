package org.bigbluebutton.modules.chat.services
{
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.chat.ChatConstants;
  import org.bigbluebutton.modules.chat.events.PrivateChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.TranscriptEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  
  public class MessageReceiver implements IMessageListener
  {
    public var dispatcher:IEventDispatcher;
    
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
        case "ChatRequestMessageHistoryReply":
          handleChatRequestMessageHistoryReply(message);
          break;	
        default:
          //   LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleChatRequestMessageHistoryReply(message:Object):void {
      var msgCount:Number = message.count as Number;
      for (var i:int = 0; i < msgCount; i++) {
        handleChatReceivePublicMessageCommand(message.messages[i]);
      }
           
      var pcEvent:TranscriptEvent = new TranscriptEvent(TranscriptEvent.TRANSCRIPT_EVENT);
      dispatcher.dispatchEvent(pcEvent);
    }
        
    private function handleChatReceivePublicMessageCommand(message:Object):void {
      LogUtil.debug("Handling public chat message [" + message.message + "]");
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.chatType = message.chatType;
      msg.fromUserID = message.fromUserID;
      msg.fromUsername = message.fromUsername;
      msg.fromColor = message.fromColor;
      msg.fromLang = message.fromLang;
      msg.fromTime = message.fromTime;
      msg.fromTimezoneOffset = message.fromTimezoneOffset;
      msg.toUserID = message.toUserID;
      msg.toUsername = message.toUsername;
      msg.message = message.message;
      
      var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
      pcEvent.message = msg;
      dispatcher.dispatchEvent(pcEvent);
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PUBLIC_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);
    }
    
    private function handleChatReceivePrivateMessageCommand(message:Object):void {
      LogUtil.debug("Handling private chat message");
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.chatType = message.chatType;
      msg.fromUserID = message.fromUserID;
      msg.fromUsername = message.fromUsername;
      msg.fromColor = message.fromColor;
      msg.fromLang = message.fromLang;
      msg.fromTime = message.fromTime;
      msg.fromTimezoneOffset = message.fromTimezoneOffset;
      msg.toUserID = message.toUserID;
      msg.toUsername = message.toUsername;
      msg.message = message.message;
      
      var pcEvent:PrivateChatMessageEvent = new PrivateChatMessageEvent(PrivateChatMessageEvent.PRIVATE_CHAT_MESSAGE_EVENT);
      pcEvent.message = msg;
      dispatcher.dispatchEvent(pcEvent);
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PRIVATE_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);      
    }
  }
}