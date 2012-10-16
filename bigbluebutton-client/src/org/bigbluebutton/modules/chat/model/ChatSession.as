package org.bigbluebutton.modules.chat.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class ChatSession
  {
    private var _chatType:String;
    private var _chatWithUserID:String;
    private var _autoTranslate:Boolean = false;    
    private var _messages:ArrayCollection = new ArrayCollection();
    
    public function ChatSession(type:String, withUserID:String, autoTranslate:Boolean=false)
    {
      _chatType = type;
      _chatWithUserID = withUserID;
      _autoTranslate = autoTranslate;
    }
    
    /**
    * return PUBLIC or PRIVATE chat
    */
    public function getType():String {
      return _chatType;  
    }
    
    public function getUserID():String {
      return _chatWithUserID;
    }
        
    public function newChatMessage(msg:Object):void {
      var cm:ChatMessage = new ChatMessage();
      
      var time:Date = new Date();
      cm.time = ChatUtil.getHours(time) + ":" + ChatUtil.getMinutes(time);
      
      if (_messages.length == 0) {
        cm.lastSenderId = msg.userID;
        cm.lastTime = cm.time;
      } else {
        cm.lastSenderId = getLastSender();
        cm.lastTime = getLastTime();
      }
      
      cm.senderId = msg.userID;
      
      cm.senderLanguage = msg.lang;
      cm.receiverLanguage = ChatUtil.getUserLang();
      cm.translate = _autoTranslate;
      
      cm.translatedText = msg.message;
      cm.senderText = msg.message;
      
      cm.name = msg.username;
      cm.senderColor = uint(msg.color);
      cm.translatedColor = msg.senderColor;
      cm.senderTime = msg.time;		
      
      _messages.addItem(cm);
            
    }
    
    private function getLastSender():String {
      var msg:ChatMessage = _messages.getItemAt(_messages.length - 1) as ChatMessage;
      return msg.senderId;
    }
    
    private function getLastTime():String {
      var msg:ChatMessage = _messages.getItemAt(_messages.length - 1) as ChatMessage;
      return msg.lastTime;
    }
        
  }
}