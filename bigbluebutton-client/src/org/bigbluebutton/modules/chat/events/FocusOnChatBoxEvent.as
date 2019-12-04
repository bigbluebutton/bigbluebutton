package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class FocusOnChatBoxEvent extends Event
  {
    public static const FOCUS_ON_CHATBOX_EVENT:String = 'focus on chat box event';
    
    public var chatId: String;
    
    public function FocusOnChatBoxEvent(chatId:String)
    {
      super(FOCUS_ON_CHATBOX_EVENT, false, false);
      this.chatId = chatId;
    }
  }
}