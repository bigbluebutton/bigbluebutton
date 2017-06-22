package org.bigbluebutton.modules.users.views
{
  import mx.collections.ArrayCollection;
  import mx.collections.Sort;
  
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.core.model.users.VoiceUser2x;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.modules.users.views.model.BBBUser2x;
  import org.bigbluebutton.modules.users.views.model.BBBVoiceUser2x;
  
  public class UsersWindowEventHandler
  {

    [Bindable] public var users:ArrayCollection = new ArrayCollection();
    [Bindable] public var voiceUsers:ArrayCollection = new ArrayCollection();
    [Bindable] public var breakoutRoomsList:ArrayCollection = new ArrayCollection();
    
    private var sort:Sort;
    
    public function UsersWindowEventHandler():void {
      sort = new Sort();
      sort.compareFunction = sortFunction;
      users.sort = sort;
      users.refresh();
    }
    
    private function removeUser(userId:String, users: ArrayCollection):void {
      for (var i:int = 0; i < users.length; i++) {
        var user:BBBUser2x = users.getItemAt(i) as BBBUser2x;
        if (user.userId == userId) {
          users.removeItemAt(i);
          users.refresh();
          return;
        }
      }
    }
    
    public function populateAllUsers():void {
      getAllWebUsers();
      getAllVoiceUsers();
    }
    
    private function getAllWebUsers():void {
      var userIds: Array = LiveMeeting.inst().users.getUserIds();
      
      for (var i:int = 0; i < userIds.length; i++) {
        var userId: String = userIds[i] as String;
        addUser(users, userId);
      }
      
      users.refresh();
    }
    
    private function addUser(users: ArrayCollection, userId: String):void {
      var user: User2x = UsersUtil.getUser2x(userId);
      var voiceUser: VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(userId);
      
      var buser: BBBUser2x = new BBBUser2x();
      buser.me = (LiveMeeting.inst().me.id == user.intId);
      buser.userId = user.intId;
      buser.name = user.name;
      buser.role = user.role;
      buser.guest = user.guest;
      buser.locked = user.locked;
      buser.emojiStatus = user.emoji;
      buser.presenter = user.presenter;
      
      buser.inVoiceConf = false;
      if (voiceUser != null) {
        buser.inVoiceConf = true;
        buser.muted = voiceUser.muted;
        buser.callingWith = voiceUser.callingWith;
        buser.talking = voiceUser.talking;
        buser.listenOnly = voiceUser.listenOnly;
        buser.voiceOnlyUser = false;
      }
      
      // We want to remove the user if it's already in the collection and re-add it.
      removeUser(userId, users);
      
      users.addItem(buser);
    }
    
    public function handleUserJoinedEvent(event: UserJoinedEvent, users: ArrayCollection):void {
      addUser(users, event.userID);
      users.refresh();
    }
    
    
    private function removeVoiceUser(userId:String, voiceUsers: ArrayCollection):void {
      for (var i:int = 0; i < voiceUsers.length; i++) {
        var user:BBBVoiceUser2x = voiceUsers.getItemAt(i) as BBBVoiceUser2x;
        if (user.userId == userId) {
          voiceUsers.removeItemAt(i);
          voiceUsers.refresh();
          return;
        }
      }
    }
    
    private function getAllVoiceUsers():void {
      var voiceOnlyUsers: Array = LiveMeeting.inst().voiceUsers.getVoiceOnlyUsers();
      
      for (var i:int = 0; i < voiceOnlyUsers.length; i++) {
        var user:VoiceUser2x = voiceOnlyUsers[i] as VoiceUser2x;
        
        var buser: BBBUser2x = new BBBUser2x();
        buser.me = (LiveMeeting.inst().me.id == user.intId);
        buser.userId = user.intId;
        buser.name = user.callerName;
        buser.role = Role.VOICE_ONLY;
        buser.guest = false;
        buser.locked = false;
        buser.emojiStatus = "none";
        buser.presenter = false;
        
        buser.inVoiceConf = true;
        buser.voiceOnlyUser = true;
        
        // We want to remove the user if it's already in the collection and re-add it.
        removeUser(buser.userId, users);
        
        users.addItem(buser);
      }
      
      users.refresh();

    }
    
    // Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
    private function sortFunction(a:Object, b:Object, array:Array = null):int {
      /*if (a.presenter)
      return -1;
      else if (b.presenter)
      return 1;*/
      if (a.role == Role.MODERATOR && b.role == Role.MODERATOR) {
        if (a.hasEmojiStatus && b.hasEmojiStatus) {
          if (a.emojiStatusTime < b.emojiStatusTime)
            return -1;
          else
            return 1;
        } else if (a.hasEmojiStatus)
          return -1;
        else if (b.hasEmojiStatus)
          return 1;
      } else if (a.role == Role.MODERATOR)
        return -1;
      else if (b.role == Role.MODERATOR)
        return 1;
      else if (a.hasEmojiStatus && b.hasEmojiStatus) {
        if (a.emojiStatusTime < b.emojiStatusTime)
          return -1;
        else
          return 1;
      } else if (a.hasEmojiStatus)
        return -1;
      else if (b.hasEmojiStatus)
        return 1;
      else if (!a.voiceOnlyUser && !b.voiceOnlyUser) {
      } else if (!a.voiceOnlyUser)
        return -1;
      else if (!b.voiceOnlyUser)
        return 1;
      /*
      * Check name (case-insensitive) in the event of a tie up above. If the name
      * is the same then use userID which should be unique making the order the same
      * across all clients.
      */
      if (a.name.toLowerCase() < b.name.toLowerCase())
        return -1;
      else if (a.name.toLowerCase() > b.name.toLowerCase())
        return 1;
      else if (a.userId.toLowerCase() > b.userId.toLowerCase())
        return -1;
      else if (a.userId.toLowerCase() < b.userId.toLowerCase())
        return 1;
      return 0;
    }
  }
}