package org.bigbluebutton.modules.chat.model
{
  import com.adobe.utils.StringUtil;
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.system.Capabilities;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.events.ChatHistoryEvent;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.modules.chat.vo.GroupChatUser;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class GroupChat  {
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
      var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(_id, msg);
      _dispatcher.dispatchEvent(pcEvent);
    }
    
    public function addMessageHistory(messageVOs:Array):void {
      if (messageVOs.length > 0) {        
        for (var i:int = 0; i < messageVOs.length; i++) {
          var newCM: ChatMessageVO = messageVOs[i] as ChatMessageVO
          _messages.addItemAt(newCM, i);
        }
      }
      
      trace("RECEIVED CHAT HISTORY FROM SERVER FOR CHAT = " + _id);
      var chEvent:ChatHistoryEvent = new ChatHistoryEvent(ChatHistoryEvent.RECEIVED_HISTORY);
      chEvent.chatId = id;
      _dispatcher.dispatchEvent(chEvent);
    }
    
    private function convertTimeNumberToString(time:Number):String {
      var sentTime:Date = new Date();
      sentTime.setTime(time);
      return ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
    }
    
    public function getAllMessageAsString():String{
      var allText:String = "";
      var returnStr:String = (Capabilities.os.indexOf("Windows") >= 0 ? "\r\n" : "\n");
      for (var i:int = 0; i < messages.length; i++){
        var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
        if (StringUtil.trim(item.name) != "") {
          allText += item.name + "\t";
        }
        allText += item.time + "\t";
        allText += item.text + returnStr;
      }
      return allText;
    }
    
    public function clearPublicChat():void {
      var cm:ChatMessage = new ChatMessage();
      cm.time = convertTimeNumberToString(new Date().time);
      cm.text = "<b><i>"+ResourceUtil.getInstance().getString('bbb.chat.clearBtn.chatMessage')+"</i></b>";
      cm.name = "";
      cm.senderColor = uint(0x000000);
      
      messages.removeAll();
      messages.addItem(cm);
      
      var welcomeEvent:ChatHistoryEvent = new ChatHistoryEvent(ChatHistoryEvent.RECEIVED_HISTORY);
      welcomeEvent.chatId = id;
      _dispatcher.dispatchEvent(welcomeEvent);
    }
  }
}