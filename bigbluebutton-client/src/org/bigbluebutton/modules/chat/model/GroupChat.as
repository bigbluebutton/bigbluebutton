package org.bigbluebutton.modules.chat.model
{
  import com.adobe.utils.StringUtil;
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.system.Capabilities;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.events.ChatHistoryEvent;
  import org.bigbluebutton.modules.chat.events.ClearPublicChatEvent;
  import org.bigbluebutton.modules.chat.events.NewGroupChatMessageEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.modules.chat.vo.GroupChatUser;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class GroupChat  {
    
    public static const PUBLIC:String = "PUBLIC_ACCESS";
    public static const PRIVATE:String = "PRIVATE_ACCESS";
    
    private var _id: String;
    private var _name: String;
    private var _access: String;
    private var _createdBy: GroupChatUser;
    private var _users: ArrayCollection;
    private var _messages: ArrayCollection;
    
    private var _dispatcher:Dispatcher = new Dispatcher();
    
    public function GroupChat(id: String,
                              name: String, access: String,
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
    
    public function isChattingWith(userId: String): Boolean {
      for (var i:int = 0; i < _users.length; i++) {
        var user:GroupChatUser = _users[i] as GroupChatUser;
        if (user.id == userId) {
          return true;
        }        
      }
      return false;
    }
      
    public function getNameAsUsers(exceptUserId:String):String {
      if (users.length == 0) return _name;
      
      var tempName:String = "";
      for (var i:int = 0; i < _users.length; i++) {
        var user:GroupChatUser = _users[i] as GroupChatUser;
        if (user.id != exceptUserId) {
          tempName += user.name + ",";
        }        
      }
      
      return tempName.slice(0,-1); 
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
      var pcEvent:NewGroupChatMessageEvent = new NewGroupChatMessageEvent(_id, msg);
      _dispatcher.dispatchEvent(pcEvent);
    }
    
    public function addMessageHistory(messageVOs:Array):void {
      if (messageVOs.length > 0) { 
        _messages = new ArrayCollection();
        for (var i:int = 0; i < messageVOs.length; i++) {
          var newCM: ChatMessageVO = messageVOs[i] as ChatMessageVO
          _messages.addItemAt(newCM, i);
        }
      }
			
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
        var chatVO: ChatMessageVO = messages.getItemAt(i) as ChatMessageVO
        var item:ChatMessage = convertChatMessage(chatVO);
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
      
      var clearChatEvent:ClearPublicChatEvent = new ClearPublicChatEvent(_id);
      _dispatcher.dispatchEvent(clearChatEvent);
    }
    
    private function convertChatMessage(msgVO:ChatMessageVO):ChatMessage {
      var cm:ChatMessage = new ChatMessage();
      
      cm.lastSenderId = "";
      cm.lastTime = "";
      
      cm.senderId = msgVO.fromUserId;
      
      cm.text = msgVO.message;
      
      cm.name = msgVO.fromUsername;
      cm.senderColor = uint(msgVO.fromColor);
      
      // Welcome message will skip time
      if (msgVO.fromTime != -1) {
        cm.fromTime = msgVO.fromTime;
        cm.time = convertTimeNumberToString(msgVO.fromTime);
      }
      return cm
    }
  }
}
