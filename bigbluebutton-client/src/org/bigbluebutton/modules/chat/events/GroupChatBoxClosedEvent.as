package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class GroupChatBoxClosedEvent extends Event
  {
    public static const CHATBOX_CLOSED_EVENT:String = 'group chat box closed event';
    
    public var chatId: String;
    public var windowId: String;
    
    public function GroupChatBoxClosedEvent(chatId:String, windowId:String)
    {
      super(CHATBOX_CLOSED_EVENT, false, false);
      this.chatId = chatId;
      this.windowId = windowId;
    }
  }
}