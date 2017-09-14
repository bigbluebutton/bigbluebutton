package org.bigbluebutton.modules.chat.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.modules.chat.events.ConversationDeletedEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatModel
  {
    public static const PUBLIC_CHAT_USERID:String = 'public_chat_userid';
    
    private var convs:Object = new Object();
    
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public static function getConvId(from:String, to: String):String {
      var members:Array = new Array(to, from);
      members.sort(); 
      return members[0] + "-" + members[1];
    }
    
    public function newChatMessage(msg:ChatMessageVO):void {
      var convId:String = getConvId(msg.fromUserId, msg.toUserId);
      
      if (convs.hasOwnProperty(convId)) {
        var cm1:ChatConversation = convs[convId] as ChatConversation;
        cm1.newChatMessage(msg);
      } else {
        var cm2:ChatConversation = new ChatConversation(convId);
        cm2.newChatMessage(msg);
        convs[convId] = cm2;
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
        trace("FOUND chatId = " + convId);
        return convs[convId];
      } else {
        trace("NOT FOUND chatId = " + convId);
        var conv: ChatConversation = new ChatConversation(convId);
        convs[convId] = conv;
        return conv;
      }
      
    }
  }
}