package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;

  public class CreateGroupChatReqEvent extends Event
  {
    public static const CREATE_GROUP_CHAT_REQ_EVENT:String = "create group chat request event";
    
    public var name: String;
    public var access: String;
    public var users: Array;
    
    public function CreateGroupChatReqEvent(name:String, access: String, users:Array)
    {
      super(CREATE_GROUP_CHAT_REQ_EVENT, false, false);
      this.name = name;
      this.access = access;
      this.users = users;
    }
  }
}