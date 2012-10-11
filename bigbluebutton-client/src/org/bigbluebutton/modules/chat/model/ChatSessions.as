package org.bigbluebutton.modules.chat.model
{
  import mx.collections.ArrayCollection;

  public class ChatSessions
  {
    
    private static const PRIVATE:String = "PRIVATE";
    private static const PUBLIC:String = "PUBLIC";
    
    private var publicChat:ArrayCollection = new ArrayCollection();
    private var privateChats:ArrayCollection = new ArrayCollection();
    
    private function getPrivateChatWith(userID:String):ArrayCollection {
      
    }
    
    private function addPrivateChatWith(userID:String):void {
      privateChats.addItem(new ChatSession("PRIVATE"
    }
    
    private function getPrivateChatWith(userID:String):ChatSession {
      for (var i:int = 0; i < privateChats.length; i++) {
        var ch:ChatSession = privateChats.getItemAt(i) as ChatSession;
        if (ch.getType() = "PRIVATE" && ch.getUserID() == userID) {
          return ch;
        }
      }
      
      return null;
    }
    
  }
}