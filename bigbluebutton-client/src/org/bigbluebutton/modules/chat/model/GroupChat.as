package org.bigbluebutton.modules.chat.model
{
  import com.asfusion.mate.events.Dispatcher;
  import mx.collections.ArrayCollection;
  import org.bigbluebutton.modules.chat.events.ChatHistoryEvent;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.modules.chat.vo.GroupChatUser;

  public class GroupChat
  {
    private var _id: String;
    private var _name: String;
    private var _access: String;
    private var _createdBy: GroupChatUser;
    private var _users: ArrayCollection;
    private var _messages: ArrayCollection;
    
    private var _dispatcher:Dispatcher = new Dispatcher();
    
    public function GroupChat(id: String, name: String, access: String,
                              createdBy: GroupChatUser, 
                              users: ArrayCollection, 
                              msg: ArrayCollection) {
      _id = id;
      _name = name;
      _access = access;
      _createdBy = createdBy;
      _users = users;
      _messages = msg;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get name(): String {
      return _name;
    }
    
    public function get access(): String {
      return _access;
    }
    
    public function get createdBy():GroupChatUser {
      return _createdBy;
    }
    
    public function get users():ArrayCollection {
      return new ArrayCollection(_users.toArray());
    }
    
    public function get messages():ArrayCollection {
      return new ArrayCollection(_messages.toArray());
    }
    
    public function addMessage(msg:ChatMessageVO):void {
      _messages.addItem(msg);
      var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(id, msg.fromUserId);
      _dispatcher.dispatchEvent(pcEvent);
    }
    
    public function addMessageHistory(messageVOs:Array):void {
      if (messageVOs.length > 0) {
        for (var i:int=1; i < messageVOs.length; i++) {
          var newCM: ChatMessageVO = messageVOs[i] as ChatMessageVO
          _messages.addItemAt(newCM, i);
        }
      }
      
      var chEvent:ChatHistoryEvent = new ChatHistoryEvent(ChatHistoryEvent.RECEIVED_HISTORY);
      chEvent.chatId = id;
      _dispatcher.dispatchEvent(chEvent);
    }
    
  }
}