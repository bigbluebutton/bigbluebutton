package org.bigbluebutton.modules.chat.views
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.modules.chat.views.model.ChatUser;

  public class ChatWindowEventHandler
  {
    [Bindable] public var users:ArrayCollection = new ArrayCollection();
    
    
    public function ChatWindowEventHandler()
    {
      users.refresh();
    }
    
    public function populateAllUsers():void {
      getAllWebUsers();
    }
    
    private function getAllWebUsers():void {
      var userIds: Array = LiveMeeting.inst().users.getUserIds();
      
      for (var i:int = 0; i < userIds.length; i++) {
        var userId: String = userIds[i] as String;
        var user: User2x = UsersUtil.getUser2x(userId);
        addUser(users, user);
      }
      
      users.refresh();
    }
    
    public function handleUserJoinedEvent(event: UserJoinedEvent):void {
      var user: User2x = UsersUtil.getUser(event.userID);
      if (user != null) {
        addUser(users, user);
        users.refresh();
      }
    }
    
    private function addUser(users: ArrayCollection, user: User2x):void {
      var buser: ChatUser = new ChatUser();
      buser.userId = user.intId;
      buser.name = user.name;
     
      // We want to remove the user if it's already in the collection and re-add it.
      removeUser(user.intId, users);
      
      users.addItem(buser);
    }
    
    private function removeUser(userId:String, users: ArrayCollection):void {
      for (var i:int = 0; i < users.length; i++) {
        var user:ChatUser = users.getItemAt(i) as ChatUser;
        if (user.userId == userId) {
          users.removeItemAt(i);
          users.refresh();
          return;
        }
      }
    }
    
    public function handleUserLeftEvent(userId: String):void {
      removeUser(userId, users);
    }
    
  }
}