package org.bigbluebutton.modules.chat.vo
{
  public class GroupChatMsgFromUser
  {
    public var correlationid: String;
    public var sender: GroupChatUser;
    public var font: String;
    public var size: Number;
    public var color: String;
    public var message: String;
    
    public function GroupChatMsgFromUser(correlationId: String,
    sender: GroupChatUser, font: String, size: Number, colort: String,
    message: String)
    {
      this.correlationid = correlationId;
      this.sender = sender;
      this.font = font;
      this.size = size;
      this.color = color;
      this.message = message;
    }
  }
}