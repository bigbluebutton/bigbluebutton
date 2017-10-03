package org.bigbluebutton.modules.chat.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.modules.chat.events.ConversationDeletedEvent;
  import org.bigbluebutton.modules.chat.events.GroupChatCreatedEvent;
  import org.bigbluebutton.modules.chat.events.ReceivedGroupChatsEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatModel
  {
    public static const MAIN_PUBLIC_CHAT:String = 'MAIN-PUBLIC-GROUP-CHAT';
    
    private var convs:Object = new Object();
    
    private var groupChats:Array = [];
    
    
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function getGroupChat(id: String):GroupChat {
      if (groupChats.hasOwnProperty(id)) {
        return groupChats[id];
      } 
      
      return null;
    }
    
    public function getGroupChatIds():Array {
      var gcIds: Array = new Array();
      for (var id:String in groupChats) {
        gcIds.push(id);
      }
      return gcIds;
    }
    
    public function addGroupChatsList(gcs: Array):void {
      for (var i: int = 0; i < gcs.length; i++) {
        var gc: GroupChat = gcs[i] as GroupChat;
        groupChats[gc.id] = gc;
      }
      dispatcher.dispatchEvent(new ReceivedGroupChatsEvent());
    }
    
    
    public function addGroupChat(gc: GroupChat):void {
      groupChats[gc.id] = gc;
      dispatcher.dispatchEvent(new GroupChatCreatedEvent(gc.id));
    }
    
    public function removeGroupChat(id: String):void {
      if (groupChats.hasOwnProperty(id)) {
        delete groupChats[id];
      } 
    }
    
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
        return convs[convId];
      } else {
        var conv: ChatConversation = new ChatConversation(convId);
        convs[convId] = conv;
        return conv;
      }
      
    }
    
    public static function toChatMessage(rawMessage:Object):ChatMessageVO {
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.fromUserId = rawMessage.fromUserId;
      msg.fromUsername = rawMessage.fromUsername;
      msg.fromColor = rawMessage.fromColor;
      msg.fromTime = rawMessage.fromTime;
      msg.fromTimezoneOffset = rawMessage.fromTimezoneOffset;
      msg.toUserId = rawMessage.toUserId;
      msg.toUsername = rawMessage.toUsername;
      msg.message = rawMessage.message;
      return msg;
    }
  }
}