package org.bigbluebutton.modules.users.views
{
  import com.adobe.utils.ArrayUtil;
  
  import mx.collections.ArrayCollection;
  import mx.collections.Sort;
  
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.core.model.users.VoiceUser2x;
  import org.bigbluebutton.main.events.StartedViewingWebcamEvent;
  import org.bigbluebutton.main.events.StoppedViewingWebcamEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStoppedEvent;
  import org.bigbluebutton.main.views.BBBDataGrid;
  import org.bigbluebutton.modules.users.views.model.BBBUser2x;
  import org.bigbluebutton.modules.users.views.model.BBBVoiceUser2x;
  
  public class UsersWindowEventHandler
  {

    [Bindable] public var users:ArrayCollection = new ArrayCollection();
    [Bindable] public var voiceUsers:ArrayCollection = new ArrayCollection();
    [Bindable] public var breakoutRoomsList:ArrayCollection = new ArrayCollection();
	private var dataGrid : BBBDataGrid;
    
    private var sort:Sort;
    
    public function UsersWindowEventHandler():void {
      sort = new Sort();
      sort.compareFunction = sortFunction;
      users.sort = sort;
      users.refresh();
    }
    
    public function handleUserEmojiChangedEvent(userId: String, emoji: String): void {
      var webUser: BBBUser2x = findUser(userId);
      if (webUser != null) {
        webUser.emojiStatus = emoji;
        webUser.emojiStatusTime = new Date();
        dataGrid.refresh();
      }
    }

    public function handleSwitchedPresenterEvent(amIPresenter: Boolean, newPresenterUserID: String): void {
      var webUser: BBBUser2x = findUser(newPresenterUserID);

      if (webUser != null) {
        webUser.presenter = amIPresenter;
        dataGrid.refresh();
      }
    }
    
    public function userStatusChanged(userId: String): void {
      var user: User2x = UsersUtil.getUser2x(userId);
      if (user != null) {
        addUser(users, user);
      }

    }
    
    public function handleUserLeftEvent(userId: String):void {
      removeUser(userId, users);
    }
    
    private function removeUser(userId:String, users: ArrayCollection):void {
      for (var i:int = 0; i < users.length; i++) {
        var user:BBBUser2x = users.getItemAt(i) as BBBUser2x;
        if (user.userId == userId) {
          users.removeItemAt(i);
          dataGrid.refresh();
          return;
        }
      }
    }

    public function getAllUsersInPresenterGroup(): ArrayCollection {
      var presenterGroup: ArrayCollection = LiveMeeting.inst().users.getPresenterGroup();
      return presenterGroup;
    }

    public function populateAllUsers(dataGrid:BBBDataGrid):void {
	  this.dataGrid = dataGrid;
      getAllWebUsers();
      getAllVoiceUsers();
    }
    
    private function getAllWebUsers():void {
      var userIds: Array = LiveMeeting.inst().users.getUserIds();
      
      for (var i:int = 0; i < userIds.length; i++) {
        var userId: String = userIds[i] as String;
        var user: User2x = UsersUtil.getUser2x(userId);
        addUser(users, user);
      }
      
      dataGrid.refresh();
    }
    
    private function getWebcamStreamsForUser(userId: String): Array {
      var streamIds: Array = LiveMeeting.inst().webcams.getStreamIdsForUser(userId);
      return streamIds;
    }
    
    private function getWebcamStreamsViewingForUser(userId: String): Array {
        var streamIds: Array = LiveMeeting.inst().webcams.getStreamIdsIAmViewingForUser(userId);
        return streamIds;
    }
    
    private function addUser(users: ArrayCollection, user: User2x):void {
      var buser: BBBUser2x = new BBBUser2x();
      buser.me = (LiveMeeting.inst().me.id == user.intId);
      buser.userId = user.intId;
      buser.name = user.name;
      buser.role = user.role;
      buser.guest = user.guest;
      buser.authed = user.authed;
      buser.locked = user.locked;
      buser.emojiStatus = user.emoji;
      buser.presenter = user.presenter;
      buser.streams = getWebcamStreamsForUser(buser.userId);
      buser.viewedStream = getWebcamStreamsViewingForUser(buser.userId);
      
      buser.inVoiceConf = false;
      
      var voiceUser: VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(user.intId);
      if (voiceUser != null) {
        buser.inVoiceConf = true;
        buser.muted = voiceUser.muted;
        buser.callingWith = voiceUser.callingWith;
        buser.talking = voiceUser.talking;
        buser.listenOnly = voiceUser.listenOnly;
        buser.voiceOnlyUser = voiceUser.voiceOnlyUser;
      }
      
      // We want to remove the user if it's already in the collection and re-add it.
      removeUser(user.intId, users);
      
      users.addItem(buser);
    }
    
    public function handleUserJoinedEvent(event: UserJoinedEvent):void {
      var user: User2x = UsersUtil.getUser(event.userID);
      if (user != null) {
        addUser(users, user);
        dataGrid.refresh();
      }
    }
    
    private function addVoiceUserToWebUser(user: BBBUser2x): void {
      var voiceUser: VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(user.userId);
      if (voiceUser != null) {
        user.inVoiceConf = true;
        user.muted = voiceUser.muted;
        user.callingWith = voiceUser.callingWith;
        user.talking = voiceUser.talking;
        user.listenOnly = voiceUser.listenOnly;
        user.voiceOnlyUser = voiceUser.voiceOnlyUser;
        
        // We want to remove the user if it's already in the collection and re-add it.
        removeUser(user.userId, users);
        users.addItem(user);
      }
    }
    
    public function handleUserJoinedVoiceConfEvent(userId: String):void {
      var webUser: BBBUser2x = findUser(userId);
      if (webUser != null) {
        addVoiceUserToWebUser(webUser);
      } else {
        var vu: VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(userId);
        if (vu != null) {
          addVoiceOnlyUser(users, vu);
        }
      }
      dataGrid.refresh();
    }
    
    public function handleUserLeftVoiceConfEvent(userId: String):void {
      var user: BBBUser2x = findUser(userId);
      if (user != null && !user.voiceOnlyUser) {
        removeVoiceFromWebUser(users, user);
      } else {
        removeUser(userId, users);
      }
      dataGrid.refresh();
    }
    
    private function removeVoiceFromWebUser(users: ArrayCollection, user: BBBUser2x):void {      
      user.inVoiceConf = false;
      user.muted = false;
      user.callingWith = "";
      user.talking = false;
      user.listenOnly = false;
      user.voiceOnlyUser = false;
      
      // We want to remove the user if it's already in the collection and re-add it.
      removeUser(user.userId, users);
      
      users.addItem(user);
    }
    
    private function addVoiceOnlyUser(users: ArrayCollection, vu: VoiceUser2x): void {
      var buser: BBBUser2x = new BBBUser2x();
      buser.me = (LiveMeeting.inst().me.id == vu.intId);
      buser.userId = vu.intId;
      buser.name = vu.callerName;
      buser.role = Role.VOICE_ONLY;
      buser.guest = false;
      buser.locked = false;
      buser.emojiStatus = "none";
      buser.presenter = false;
      
      buser.inVoiceConf = true;
      buser.muted = vu.muted;
      buser.callingWith = vu.callingWith;
      buser.talking = vu.talking;
      buser.listenOnly = vu.listenOnly;
      buser.voiceOnlyUser = true;
      
      // We want to remove the user if it's already in the collection and re-add it.
      removeUser(buser.userId, users);
      
      users.addItem(buser);
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
        addVoiceOnlyUser(users, user);
      }
      
      dataGrid.refresh();
    }
    
    public function handleUserTalkingEvent(userId: String, talking: Boolean): void {
      var user: BBBUser2x = findUser(userId);
      if (user != null) {
        user.talking = talking;
        if (user.muted && talking) user.talking = false;
      }
      dataGrid.refresh();
    }
    
    public function handleUserMutedEvent(userId: String, muted: Boolean): void {
      var user: BBBUser2x = findUser(userId);
      if (user != null) {
        user.muted = muted;
        if (muted) user.talking = false;
      }
      dataGrid.refresh();
    }
    
    
    private function refreshWebcamStreamsInfo(userId: String): void {
        var user: BBBUser2x = findUser(userId);
        if (user != null) {
            user.streams = getWebcamStreamsForUser(user.userId);
            user.viewedStream = getWebcamStreamsViewingForUser(user.userId);
        }
        dataGrid.refresh();
    }
    
    public function handleStoppedViewingWebcamEvent(event: StoppedViewingWebcamEvent): void {
        refreshWebcamStreamsInfo(event.webcamUserID);
    }
    
    public function handleStartedViewingWebcamEvent(event: StartedViewingWebcamEvent): void {
        refreshWebcamStreamsInfo(event.webcamUserID);
    }
    
    public function handleStreamStartedEvent(event: StreamStartedEvent): void {
        refreshWebcamStreamsInfo(event.userID);
    }
    
    public function handleStreamStoppedEvent(event: StreamStoppedEvent): void {
        refreshWebcamStreamsInfo(event.userId);
    }
    
    public function handleMadePresenterEvent(userId: String): void {
      var user: BBBUser2x = findUser(userId);
      if (user != null) {
        user.presenter = true;
      }
      dataGrid.refresh();
    }
    
    public function handleMadeVieweEvent(userId: String): void {
      var user: BBBUser2x = findUser(userId);
      if (user != null) {
        user.presenter = false;
      }
      dataGrid.refresh();
    }
	
	public function handleBreakoutRoomsUsersListUpdatedEvent() : void {
		for (var i : int; i < users.length; i++) {
			BBBUser2x(users[i]).breakoutRooms = ArrayUtil.copyArray(LiveMeeting.inst().users.getUser(BBBUser2x(users[i]).userId).breakoutRooms);
		}
		dataGrid.refresh();
	}
    
    private function findUser(userId: String): BBBUser2x {
      for (var i: int = 0; i < users.length; i++) {
        var user: BBBUser2x = users[i] as BBBUser2x;
        if (user != null && user.userId == userId) {
          return user;
        }
      }
      
      return null;
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
