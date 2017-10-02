package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class PrivateGroupChatCreatedEvent extends Event
  {
    public static const PRIVATE_GROUP_CHAT_CREATED_EVENT:String = "private group chat create event";
    
    public var chatId:String;
    
    public function PrivateGroupChatCreatedEvent(chatId:String)
    {
      super(PRIVATE_GROUP_CHAT_CREATED_EVENT, false, false);
      this.chatId = chatId;
    }
  }
}