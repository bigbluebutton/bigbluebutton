package org.bigbluebutton.modules.chat.model
{
  public class CHAT
  {
    private static var chatSessions:ChatSessions = null;
    
    public static function getSessions():ChatSessions {
      if (chatSessions == null) {
        chatSessions = new ChatSessions();
      }
      
      return chatSessions;
    }
  }
}