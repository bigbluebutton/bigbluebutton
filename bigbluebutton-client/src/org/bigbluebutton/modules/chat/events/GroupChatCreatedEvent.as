package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class GroupChatCreatedEvent extends Event
  {
    public static const GROUP_CHAT_CREATED_EVENT:String = "group chat created event";
    
    public var chatId: String;
    
    public function GroupChatCreatedEvent(chatId:String)
    {
      super(GROUP_CHAT_CREATED_EVENT, false, false);
      this.chatId = chatId;
    }
  }
}