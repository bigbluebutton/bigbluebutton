package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  
  public class NewGroupChatMessageEvent extends Event
  {
    public static const NEW_GROUP_CHAT_MSG_RECEIVED:String = 'received new group chat message';
    
    public var chatId:String;
    public var msg:ChatMessageVO;
    
    public function NewGroupChatMessageEvent(chatId: String, msg:ChatMessageVO)
    {
      super(NEW_GROUP_CHAT_MSG_RECEIVED, false, false);
      this.chatId = chatId;
      this.msg = msg;
    }
  }
}