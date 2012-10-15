package org.bigbluebutton.modules.chat.vo
{
	public class ChatMessageVO {
    // The type of chat (PUBLIC or PRIVATE)
    public var chatType:String;
    
    // The sender
    public var fromUserID:String;    
    public var fromUsername:String;
    public var fromColor:String;
    public var fromTime:String;    
    public var fromLang:String; 
    
    // The receiver. For PUBLIC chat this is empty
    public var toUserID:String = "";
    public var toUsername:String = "";
    
		public var message:String;
		

    public function toObj():Object {
      var m:Object = new Object();
      m.chatType = chatType;
      m.fromUserID = fromUserID;
      m.fromUsername = fromUsername;
      m.fromColor = fromColor;
      m.fromTime = fromTime;
      m.fromLang = fromLang;
      m.message = message;
      m.toUserID = toUserID;
      m.toUsername = toUsername;
      
      return m;
    }

	}
}