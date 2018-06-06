package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class GetWelcomeMessageEvent extends Event
  {
    public static const GET_WELCOME_MESSAGE:String = "GET WELCOME MESSAGE EVENT";
    
    public var chatId: String;
    
    public function GetWelcomeMessageEvent(chatId: String)
    {
      super(GET_WELCOME_MESSAGE, false, false);
      this.chatId = chatId;
      
    }
  }
}