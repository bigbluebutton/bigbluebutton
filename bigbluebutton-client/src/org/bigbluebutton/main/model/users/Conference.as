/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.main.model.users {
  
  import mx.collections.ArrayCollection;
  import mx.collections.Sort;
  
  import org.as3commons.lang.ArrayUtils;
  import org.as3commons.lang.StringUtils;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  
  public class Conference {
    
    private static const LOGGER:ILogger = getClassLogger(Conference);
    
    [Bindable]
    public var users:ArrayCollection = null;
    
    private var sort:Sort;
    
    public function Conference():void {
      users = new ArrayCollection();
      sort = new Sort();
      sort.compareFunction = sortFunction;
      users.sort = sort;
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
      else if (!a.phoneUser && !b.phoneUser) {
      } else if (!a.phoneUser)
        return -1;
      else if (!b.phoneUser)
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
      else if (a.userID.toLowerCase() > b.userID.toLowerCase())
        return -1;
      else if (a.userID.toLowerCase() < b.userID.toLowerCase())
        return 1;
      return 0;
    }
    
    public function addUser(newuser:BBBUser):void {
      if (hasUser(newuser.userID)) {
        removeUser(newuser.userID);
      }
      if (newuser.userID == LiveMeeting.inst().me.id) {
        newuser.me = true;
      }
      users.addItem(newuser);
      users.refresh();
    }
    
    public function hasUser(userID:String):Boolean {
      var p:Object = getUserIndex(userID);
      if (p != null) {
        return true;
      }
      return false;
    }
    
    public function hasOnlyOneModerator():Boolean {
      var p:BBBUser;
      var moderatorCount:int = 0;
      for (var i:int = 0; i < users.length; i++) {
        p = users.getItemAt(i) as BBBUser;
        if (p.role == Role.MODERATOR) {
          moderatorCount++;
        }
      }
      if (moderatorCount == 1)
        return true;
      return false;
    }
    
    public function getTheOnlyModerator():BBBUser {
      var p:BBBUser;
      for (var i:int = 0; i < users.length; i++) {
        p = users.getItemAt(i) as BBBUser;
        if (p.role == Role.MODERATOR) {
          return BBBUser.copy(p);
        }
      }
      return null;
    }
    
    public function userIsModerator(userId:String):Boolean {
      var user:BBBUser = getUser(userId);
      return user != null && user.role == Role.MODERATOR;
    }
    
    public function getPresenter():BBBUser {
      var p:BBBUser;
      for (var i:int = 0; i < users.length; i++) {
        p = users.getItemAt(i) as BBBUser;
        if (isUserPresenter(p.userID)) {
          return BBBUser.copy(p);
        }
      }
      return null;
    }
    
    public function getUser(userID:String):BBBUser {
      var p:Object = getUserIndex(userID);
      if (p != null) {
        return p.participant as BBBUser;
      }
      return null;
    }
    
    public function getUserWithExternUserID(userID:String):BBBUser {
      var p:BBBUser;
      for (var i:int = 0; i < users.length; i++) {
        p = users.getItemAt(i) as BBBUser;
        if (p.externUserID == userID) {
          return BBBUser.copy(p);
        }
      }
      return null;
    }
    
    public function isUserPresenter(userID:String):Boolean {
      var user:Object = getUserIndex(userID);
      if (user == null) {
        return false;
      }
      var a:BBBUser = user.participant as BBBUser;
      return a.presenter;
    }
    
    public function removeUser(userID:String):void {
      var p:Object = getUserIndex(userID);
      if (p != null) {
        users.removeItemAt(p.index);
        //sort();
        users.refresh();
      }
    }
    
    /**
     * Get the index number of the participant with the specific userid
     * @param userid
     * @return -1 if participant not found
     *
     */
    private function getUserIndex(userID:String):Object {
      var aUser:BBBUser;
      for (var i:int = 0; i < users.length; i++) {
        aUser = users.getItemAt(i) as BBBUser;
        if (aUser.userID == userID) {
          return {index: i, participant: aUser};
        }
      }
      // Participant not found.
      return null;
    }
    
    
    public function muteMyVoice(mute:Boolean):void {
      voiceMuted = mute;
    }
    
    public function isMyVoiceMuted():Boolean {
      return LiveMeeting.inst().myStatus.voiceMuted;
    }
    
    [Bindable]
    public function set voiceMuted(m:Boolean):void {
      LiveMeeting.inst().myStatus.voiceMuted = m;
    }
    
    public function get voiceMuted():Boolean {
      return LiveMeeting.inst().myStatus.voiceMuted;
    }
    
    public function setMyVoiceJoined(joined:Boolean):void {
      LiveMeeting.inst().myStatus.voiceJoined = joined;
    }
    
    public function amIVoiceJoined():Boolean {
      return LiveMeeting.inst().myStatus.voiceJoined;
    }
    
    /** Hook to make the property Bindable **/
    [Bindable]
    public function set voiceJoined(j:Boolean):void {
      LiveMeeting.inst().myStatus.voiceJoined = j;
    }
    
    public function get voiceJoined():Boolean {
      return LiveMeeting.inst().myStatus.voiceJoined;
    }
    
    [Bindable]
    public function set locked(locked:Boolean):void {
      LiveMeeting.inst().myStatus.userLocked = locked;
    }
    
    public function get locked():Boolean {
      return LiveMeeting.inst().myStatus.userLocked;
    }
    
    public function setMyRole(role:String):void {
      LiveMeeting.inst().me.role = role;
      UsersUtil.applyLockSettings();
    }
    
    public function removeAllParticipants():void {
      //users.removeAll();
      //users.refresh();
      for (var i:int = 0; i < users.length; i++) {
        users.removeItemAt(i);
        //sort();
        users.refresh();
      }
    }
    
    public function emojiStatus(userId:String, emoji:String):void {
      var aUser:BBBUser = getUser(userId);
      if (aUser != null) {
        aUser.userEmojiStatus(emoji)
      }
      users.refresh();
    }
    
    public function sharedWebcam(userId:String, stream:String):void {
      var webcamsOnlyForModerator:Boolean = LiveMeeting.inst().meeting.webcamsOnlyForModerator;
      if (!webcamsOnlyForModerator || 
        (webcamsOnlyForModerator && (UsersUtil.amIModerator() || userIsModerator(userId)))
      ) {
        var aUser:BBBUser = getUser(userId);
        if (aUser != null) {
          aUser.sharedWebcam(stream)
        }
        users.refresh();
      }
    }
    
    public function unsharedWebcam(userId:String, stream:String):void {
      var aUser:BBBUser = getUser(userId);
      if (aUser != null) {
        aUser.unsharedWebcam(stream);
      }
      users.refresh();
    }
    
    public function presenterStatusChanged(userId:String, presenter:Boolean):void {
      var aUser:BBBUser = getUser(userId);
      if (aUser != null) {
        aUser.presenterStatusChanged(presenter)
      }
      users.refresh();
    }
    
    public function newUserStatus(userID:String, status:String, value:Object):void {
      var aUser:BBBUser = getUser(userID);
      if (aUser != null) {
        var s:Status = new Status(status, value);
        aUser.changeStatus(s);
      }
      
      users.refresh();
    }
    
    public function newUserRole(userID:String, role:String):void {
      var aUser:BBBUser = getUser(userID);
      if (aUser != null) {
        aUser.role = role;
      }
      users.refresh();
    }
    
    public function getUserIDs():ArrayCollection {
      var uids:ArrayCollection = new ArrayCollection();
      for (var i:int = 0; i < users.length; i++) {
        var u:BBBUser = users.getItemAt(i) as BBBUser;
        uids.addItem(u.userID);
      }
      return uids;
    }
    
    
    public function getMyUser():BBBUser {
      var eachUser:BBBUser;
      for (var i:int = 0; i < users.length; i++) {
        eachUser = users.getItemAt(i) as BBBUser;
        if (eachUser.userID == LiveMeeting.inst().me.id) {
          return eachUser;
        }
      }
      return null;
    }
    
    public function refreshUsers():void {
      users.refresh(); // we need to refresh after updating the lock settings to trigger the user item renderers to redraw
    }
    
    
    public function updateBreakoutRoomUsers(breakoutMeetingId:String, breakoutUsers:Array):void {
      var room:BreakoutRoom = UsersUtil.getBreakoutRoom(breakoutMeetingId);
      if (room != null) {
        room.users = new ArrayCollection(breakoutUsers);
        var updateUsers:Array = [];
        // Update users breakout rooms
        var user:BBBUser;
        for (var i:int = 0; i < breakoutUsers.length; i++) {
          var userId:String = StringUtils.substringBeforeLast(breakoutUsers[i].id, "-");
          user = getUser(userId);
          if (user) {
            user.addBreakoutRoom(room.sequence)
          }
          updateUsers.push(userId);
        }
        // Remove users breakout rooms if the users left the breakout rooms
        for (var j:int = 0; j < users.length; j++) {
          user = BBBUser(users.getItemAt(j));
          if (updateUsers.indexOf(BBBUser(users.getItemAt(j)).userID) == -1 && ArrayUtils.contains(user.breakoutRooms, room.sequence)) {
            user.removeBreakoutRoom(room.sequence);
          }
        }
        users.refresh();
      }
    }
    
    public function removeBreakoutRoomFromUser(room: BreakoutRoom):void {			
      // Remove breakout room number display from users
      for (var i:int; i < users.length; i++) {
        if (ArrayUtils.contains(users[i].breakoutRooms, room.sequence)) {
          users[i].removeBreakoutRoom(room.sequence);
        }
      }
      users.refresh();
    }
    
    
    public function getUserAvatarURL(userID:String):String { // David, to get specific user avatar url
      if(userID != null ){
        var p:Object = getUserIndex(userID);
        if (p != null) {
          var u:BBBUser = p.participant as BBBUser;
          if(StringUtils.isEmpty(u.avatarURL)){
            return LiveMeeting.inst().me.avatarURL;
          }
          return u.avatarURL;
        }
      }
      return LiveMeeting.inst().me.avatarURL;
    }
  }
}
