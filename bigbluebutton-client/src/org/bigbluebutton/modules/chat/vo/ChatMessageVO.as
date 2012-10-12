package org.bigbluebutton.modules.chat.vo
{
	public class ChatMessageVO {
    // The type of chat (PUBLIC or PRIVATE)
    public var chatType:String;
    
    // The sender's user id
    public var fromUserID:String;
    
    public var fromName:String;
    
    //The sender's language
    public var fromLang:String; 
    
		public var message:String;
		
		public var color:String;
		public var sendTime:String;

	}
}