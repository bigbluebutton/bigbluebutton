package org.bigbluebutton.modules.chat.model
{
  
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.modules.chat.events.ConversationDeletedEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatConverstations
  {
    private var convs:Object = new Object();
    
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function getConvId(from:String, to: String):String {
      if (from < to) {
        return from + "-" to;
      }
      return to + "-" from;
    }
    
    public function newChatMessage(msg:ChatMessageVO):void {
      var convId:String = getConvId(msg.fromUserID, msg.toUserID);
      
      if (convs.hasOwnProperty(convId)) {
        var cm:ChatConversation = convs[convId] as ChatConversation;
        cm.newChatMessage(msg);
      } else {
        var cm:ChatConversation = new ChatConversation();
        cm.newChatMessage(msg);
        convs[convId] = cm;
      }
    }
    
    public function userLeft(userid:String):void {
      for (var convId:String in convs){
        if (convId.indexOf(userid) > 0) {
          delete convs[convId];
          dispatcher.dispatchEvent(new ConversationDeletedEvent(convId));
        }
      }
    }
    
    public function getChatConversation(convId:String):ChatConversation {
      if (convs.hasOwnProperty(convId)) {
        return convs[convId];
      }
      return new ChatConversation();
    }
  }
}