package org.bigbluebutton.modules.chat.vo
{
  public class GroupChatUser
  {
    public var id: String;
    public var name: String;
    
    public function GroupChatUser(id: String, name: String)
    {
      this.id = id;
      this.name = name;
    }
  }
}