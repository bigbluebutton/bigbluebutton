package org.bigbluebutton.modules.chat.vo
{
  public class GroupChatMsgFromUser
  {
    public var correlationId: String;
    public var sender: GroupChatUser;
    public var color: String;
    public var message: String;
    
    public function GroupChatMsgFromUser(correlationId: String,
    sender: GroupChatUser, color: String, message: String)
    {
      this.correlationId = correlationId;
      this.sender = sender;
      this.color = color;
      this.message = message;
    }
  }
}