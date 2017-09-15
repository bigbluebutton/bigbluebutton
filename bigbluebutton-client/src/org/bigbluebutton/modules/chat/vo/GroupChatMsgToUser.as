package org.bigbluebutton.modules.chat.vo
{
  public class GroupChatMsgToUser
  {
    public var id: String;
    public var timestamp: Number;
    public var correlationId: String;
    public var sender: GroupChatUser;
    public var font: String;
    public var size: Number;
    public var color: String;
    public var message: String;
    
    public function GroupChatMsgToUser(id: String, timestamp: Number, 
                                       correlationId: String, sender: GroupChatUser,
                                       font: String, size: Number, 
                                       color: String, message: String)
    {
      this.id = id;
      this.timestamp = timestamp;
      this.correlationId = correlationId;
      this.sender = sender;
      this.font = font;
      this.size = size;
      this.color = color;
      this.message = message;
    }
  }
}