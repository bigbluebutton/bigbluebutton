package org.bigbluebutton.modules.chat.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.chat.vo.GroupChatUser;

  public class GroupChat
  {
    private var _id: String;
    private var _name: String;
    private var _access: String;
    private var _createdBy: GroupChatUser;
    private var _users: ArrayCollection;
    private var _messages: ArrayCollection;
    
    public function GroupChat(id: String, name: String, access: String,
    createdBy: GroupChatUser, users: ArrayCollection, msg: ArrayCollection)
    {
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
  }
}