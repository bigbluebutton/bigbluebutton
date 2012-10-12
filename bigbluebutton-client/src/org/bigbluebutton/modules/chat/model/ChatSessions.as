package org.bigbluebutton.modules.chat.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;

  public class ChatSessions
  {
    
    private static const PRIVATE:String = "PRIVATE";
    private static const PUBLIC:String = "PUBLIC";
    private static const PUBLIC_CHAT_USERID:String = "PUBLIC_CHAT_USERID";
    
    private var publicChat:ChatSession = null;
    private var privateChats:ArrayCollection = new ArrayCollection();
    
    public function ChatSessions() {
      publicChat = new ChatSession(PUBLIC, PUBLIC_CHAT_USERID);
    }
    
    public function newPublicChatMessage(msg:Object):void {
      publicChat.newChatMessage(msg);  			
    }
    
    public function newPrivateChatMessage(msg:Object):void {
      var userID:String = msg.userID;
      var cs:ChatSession = getPrivateChatWith(userID);
      if (cs != null) {
        cs.newChatMessage(msg);
      }
    }
    
    /******************************************************************
    *       PRIVATE FUNCTIONS
    ******************************************************************/
    private function getPrivateChatIndex(userID:String):int {
      for (var i:int = 0; i < privateChats.length; i++) {
        var ch:ChatSession = privateChats.getItemAt(i) as ChatSession;
        if (ch.getType() == PRIVATE && ch.getUserID() == userID) {
          return i;
        }
      }    
      
      return -1;
    }
    
    private function removePrivateChatWith(userID:String):void {
      var chatIndex:int = getPrivateChatIndex(userID);
      if (chatIndex > -1) {
        privateChats.removeItemAt(chatIndex);
      }

    }
    
    private function addPrivateChatWith(userID:String):void {
      privateChats.addItem(new ChatSession(PRIVATE, userID));
    }
    
    private function getPrivateChatWith(userID:String):ChatSession {
      for (var i:int = 0; i < privateChats.length; i++) {
        var ch:ChatSession = privateChats.getItemAt(i) as ChatSession;
        if (ch.getType() == PRIVATE && ch.getUserID() == userID) {
          return ch;
        }
      }
      
      return null;
    }
    
  }
}