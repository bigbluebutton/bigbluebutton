package org.bigbluebutton.modules.chat.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatMessages
  { 
    [Bindable]
    public var messages:ArrayCollection = new ArrayCollection();
    
    public var autoTranslate:Boolean = false;
    
    public function numMessages():int {
      return messages.length;
    }
    
    public function newChatMessage(msg:ChatMessageVO):void {
      var cm:ChatMessage = new ChatMessage();
      
      var time:Date = new Date();
      cm.time = ChatUtil.getHours(time) + ":" + ChatUtil.getMinutes(time);
      
      if (messages.length == 0) {
        cm.lastSenderId = "";
        cm.lastTime = cm.time;
      } else {
        cm.lastSenderId = getLastSender();
        cm.lastTime = getLastTime();
      }
      
      cm.senderId = msg.fromUserID;
      
      cm.senderLanguage = msg.fromLang;
      cm.receiverLanguage = ChatUtil.getUserLang();
      cm.translate = autoTranslate;
      
      cm.translatedText = msg.message;
      cm.senderText = msg.message;
      
      cm.name = msg.fromUsername;
      cm.senderColor = uint(msg.fromColor);
      cm.translatedColor = uint(msg.fromColor);
      
      cm.fromTime = msg.fromTime;		
      cm.fromTimezoneOffset = msg.fromTimezoneOffset;
      
      var sentTime:Date = new Date();
      sentTime.setTime(cm.fromTime);
      cm.senderTime = ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
      
      messages.addItem(cm); 
    }
    
    public function getAllMessageAsString():String{
      var allText:String = "";
      for (var i:int = 0; i < messages.length; i++){
        var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
        allText += "\n" + item.name + " - " + item.time + " : " + item.translatedText;
      }
      return allText;
    }
    
    private function getLastSender():String {
      var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
      return msg.senderId;
    }
    
    private function getLastTime():String {
      var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
      return msg.lastTime;
    }
            
  }
}