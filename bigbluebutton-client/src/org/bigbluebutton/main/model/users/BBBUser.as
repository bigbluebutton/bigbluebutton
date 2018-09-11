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
package org.bigbluebutton.main.model.users
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.Event;
  
  import org.as3commons.lang.ArrayUtils;
  import org.as3commons.lang.StringUtils;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.LockControlEvent;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class BBBUser {
    private static const LOGGER:ILogger = getClassLogger(BBBUser);
    
    public static const MODERATOR:String = "MODERATOR";
    public static const VIEWER:String = "VIEWER";
    public static const PRESENTER:String = "PRESENTER";
    
    public var dispatcher:Dispatcher = new Dispatcher();
    
    // Flag to tell that user is in the process of leaving the meeting.
    public var isLeavingFlag:Boolean = false;
    
    [Bindable] public var me:Boolean = false;
    [Bindable] public var userID:String = "UNKNOWN USER";
    [Bindable] public var externUserID:String = "UNKNOWN USER";
    [Bindable] public var name:String;
    [Bindable] public var talking:Boolean = false;
    [Bindable] public var phoneUser:Boolean = false;
    [Bindable] public var listenOnly:Boolean = false;
    
    [Bindable] public var disableMyCam:Boolean = false;
    [Bindable] public var disableMyMic:Boolean = false;
    [Bindable] public var disableMyPrivateChat:Boolean = false;
    [Bindable] public var disableMyPublicChat:Boolean = false;
    [Bindable] public var lockedLayout:Boolean = false;
    [Bindable] public var avatarURL:String="";
    
    [Bindable] public var guest:Boolean = false;
    [Bindable] public var waitingForAcceptance:Boolean = false;
    
    [Bindable]
    public function get hasStream():Boolean {
      return streamNames.length > 0;
    }
    public function set hasStream(s:Boolean):void {
      throw new Error("hasStream cannot be set. It is derived directly from streamName");
    }
    
    [Bindable] private var _viewingStream:Array = new Array();
    
    [Bindable]
    public function get viewingStream():Array {
      return _viewingStream;
    }
    public function set viewingStream(v:Array):void {
      throw new Error("Please use the helpers addViewingStream or removeViewingStream to handle viewingStream");
    }
    public function addViewingStream(streamName:String):Boolean {
      if (isViewingStream(streamName)) {
        return false;
      }
      
      _viewingStream.push(streamName);
      return true;
    }
    public function removeViewingStream(streamName:String):Boolean {
      if (!isViewingStream(streamName)) {
        return false;
      }
      
      _viewingStream = _viewingStream.filter(function(item:*, index:int, array:Array):Boolean { return item != streamName; });
      return true;
    }
    private function isViewingStream(streamName:String):Boolean {
      return _viewingStream.some(function(item:*, index:int, array:Array):Boolean { return item == streamName; });
    }
    public function isViewingAllStreams():Boolean {
      return _viewingStream.length == streamNames.length;
    }
    
    [Bindable] public var streamNames:Array = new Array();
    
    [Bindable]
    public function get streamName():String {
      var streams:String = "";
      for each(var stream:String in streamNames) {
        streams = streams + stream + "|";
      }
      //Remove last |
      streams = streams.slice(0, streams.length-1);
      return streams;
    }
    
    private function hasThisStream(streamName:String):Boolean {
      return streamNames.some(function(item:*, index:int, array:Array):Boolean { return item == streamName; });
    }
    
    public function set streamName(streamNames:String):void {
      if(streamNames) {
        var streamNamesList:Array = streamNames.split("|");
        for each(var streamName:String in streamNamesList) {
          sharedWebcam(streamName);
        }
      }
    }
    
    private var _presenter:Boolean = false;
    [Bindable] 
    public function get presenter():Boolean {
      return _presenter;
    }
    public function set presenter(p:Boolean):void {
      _presenter = p;
      verifyUserStatus();
    }
    
    public var emojiStatusTime:Date;
    private var _emojiStatus:String = "none";
    
    [Bindable("emojiStatusChange")]
    public function get emojiStatus():String {
      return _emojiStatus;
    }
    public function set emojiStatus(r:String):void {
      _emojiStatus = r;
      emojiStatusTime = (r ? new Date() : null);
      verifyUserStatus();
      dispatcher.dispatchEvent(new Event("emojiStatusChange")); 
    }
    
    [Bindable("emojiStatusChange")]
    public function get hasEmojiStatus():Boolean {
      return !StringUtils.isEmpty(_emojiStatus) && _emojiStatus != "none" && _emojiStatus != "null";
    }
    
    private var _role:String = Role.VIEWER;
    [Bindable] 
    public function get role():String {
      return _role;
    }
    public function set role(r:String):void {
      _role = r;
      verifyUserStatus();
    }
    
    [Bindable] public var room:String = "";
    [Bindable] public var selected:Boolean = false;
    
    private var _voiceMuted:Boolean = false;
    [Bindable]
    public function get voiceMuted():Boolean {
      return _voiceMuted;
    }
    public function set voiceMuted(v:Boolean):void {
      _voiceMuted = v;
      verifyMedia();
    }
    
    private var _voiceJoined:Boolean = false;
    [Bindable] 
    public function get voiceJoined():Boolean {
      return _voiceJoined;
    }
    public function set voiceJoined(v:Boolean):void {
      _voiceJoined = v;
      verifyMedia();
    }
    
    [Bindable] public var userLocked:Boolean = false;
    [Bindable] public var status:String = "";
    [Bindable] public var customdata:Object = {};
    
    /*
    * This variable is for accessibility for the Users Window. It can't be manually set
    * and only changes when one of the relevant status variables changes. Use the verifyUserStatus
    * method to update the value.
    *			Chad
    */
    private var _userStatus:String = "";
    [Bindable] 
    public function get userStatus():String {
      return _userStatus;
    }
    private function set userStatus(s:String):void {}
    private function verifyUserStatus():void {
      if (presenter)
        _userStatus = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.presenter');
      else if (role == Role.MODERATOR)
        _userStatus = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.moderator');
      else if (hasEmojiStatus)
        _userStatus = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.' + _emojiStatus);
      else
        _userStatus = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.viewer');
    }
    
    public function amIGuest():Boolean {
      return guest;
    }
    
    /*
    * This variable is for accessibility for the Users Window. It can't be manually set
    * and only changes when one of the relevant media variables changes. Use the verifyMedia
    * method to update the value.
    *			Chad
    */
    private var _media:String = "";
    [Bindable] 
    public function get media():String {
      return _media;
    }
    private function set media(m:String):void {}
    private function verifyMedia():void {
      _media = (hasStream ? ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer.webcam') + " " : "") + 
        (!voiceJoined ? ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer.noAudio') : 
          (voiceMuted ? ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer.micOff') : 
            ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer.micOn')));
    }
    
    private var _status:StatusCollection = new StatusCollection();
    
    public function buildStatus():void {
      var showingWebcam:String="";
      var isPresenter:String="";
      var hasEmoji:String = "";
      if (hasStream)
        showingWebcam=ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.streamIcon.toolTip');
      if (presenter)
        isPresenter=ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.presIcon.toolTip');
      if (hasEmojiStatus)
		// @fixme : need adding tooltip string for emoji
        hasEmoji = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.'+ emojiStatus +'.toolTip');
      
      status = showingWebcam + isPresenter + hasEmoji;
    }
    
    public function addStatus(status:Status):void {
      _status.addStatus(status);
    }
    
    public function userEmojiStatus(emoji: String):void {
      emojiStatus = emoji;
      if (me) {
        UsersUtil.setMyEmoji(emoji);
      }
      buildStatus();
    }
    
    public function sharedWebcam(stream: String):void {
      if(stream && stream != "" && !hasThisStream(stream)) {
        streamNames.push(stream);
        sendStreamStartedEvent(stream);
      }
      buildStatus();
      verifyMedia();
    }
    
    public function unsharedWebcam(stream: String):void {
      streamNames = streamNames.filter(function(item:*, index:int, array:Array):Boolean { return item != stream });
      buildStatus();
      verifyMedia();
    }
    
    public function presenterStatusChanged(presenter: Boolean):void {
      this.presenter = presenter;
      buildStatus();
    }
    
    public function lockStatusChanged(locked: Boolean):void {
      userLocked = locked;
      applyLockSettings();
      buildStatus();
    }
    
    public function changeStatus(status:Status):void {
      switch (status.name) {
        case "presenter":
          presenter=(status.value.toString().toUpperCase() == "TRUE") ? true : false;
          break;
        case "hasStream":
          var streamInfo:Array=String(status.value).split(/,/);
          /**
           * Cannot use this statement as new Boolean(expression)
           * return true if the expression is a non-empty string not
           * when the string equals "true". See Boolean class def.
           *
           * hasStream = new Boolean(String(streamInfo[0]));
           */
          var streamNameInfo:Array=String(streamInfo[1]).split(/=/);
          streamName=streamNameInfo[1];
          break;
        // @FIXME : check the coming status from the server
        case "emojiStatus":
          emojiStatus = status.value.toString();
          if (me) {
            UsersUtil.setMyEmoji(status.value.toString());
          }
          break;
      }
      buildStatus();
    }
    
    public function removeStatus(name:String):void {
      _status.removeStatus(name);
    }
    
    public function getStatus(name:String):Status {
      return _status.getStatus(name);
    }
    
    private var _breakoutRooms : Array = [];
    
    [Bindable("displayNameChange")]
    public function get displayName():String {
      if (ArrayUtils.isEmpty(_breakoutRooms)) {
        return name;
      } else {
        return "[" + _breakoutRooms.join(",") + "] " + name;
      }
    }
    
    public function get breakoutRooms():Array {
      return _breakoutRooms;
    }
    
    public function set breakoutRooms(rooms:Array):void {
      _breakoutRooms = rooms;
      dispatcher.dispatchEvent(new Event("displayNameChange"));
    }
    
    public function addBreakoutRoom(roomNumber:int):void {
      if (!ArrayUtils.contains(_breakoutRooms, roomNumber)) {
        _breakoutRooms.push(roomNumber);
        dispatcher.dispatchEvent(new Event("displayNameChange"));
      }
    }
    
    public function removeBreakoutRoom(roomNumber:int):void {
      _breakoutRooms.splice(_breakoutRooms.indexOf(roomNumber), 1);
      dispatcher.dispatchEvent(new Event("displayNameChange"));
    }
    
    public static function copy(user:BBBUser):BBBUser {
      var n:BBBUser = new BBBUser();
      n.me = user.me;
      n.userID = user.userID;
      n.externUserID = user.externUserID;
      n.name = user.name;
      n._viewingStream = user._viewingStream;
      n.streamNames = user.streamNames;
      n.presenter = user.presenter;
      n.emojiStatus = user.emojiStatus;
      n.role = user.role;	
      n.room = user.room;
      n.customdata = user.customdata;
      n.media = user.media;
      n.phoneUser = user.phoneUser;
      n.talking = user.talking;
      n.userStatus = user.userStatus;
      n.voiceJoined = user.voiceJoined;
      n.userLocked = user.userLocked;
      n.voiceMuted = user.voiceMuted;
      n.disableMyCam = user.disableMyCam;
      n.disableMyMic = user.disableMyMic;
      n.disableMyPrivateChat = user.disableMyPrivateChat;
      n.disableMyPublicChat = user.disableMyPublicChat;
      n.breakoutRooms = user.breakoutRooms.concat(); // concatenate an array with nothing to deliver a new array.
      n.guest = user.guest;
      return n;		
    }
    
    private function sendStreamStartedEvent(stream: String):void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new StreamStartedEvent(userID, name, stream));
    }
    
    public function applyLockSettings():void {
      var lockSettings:LockSettingsVO = UsersUtil.getLockSettings();
      var amNotModerator:Boolean = !UsersUtil.amIModerator();
      var amNotPresenter:Boolean = !UsersUtil.amIPresenter();
      var lockAppliesToMe:Boolean = me && amNotModerator && amNotPresenter && userLocked;
      
      disableMyCam = lockAppliesToMe && lockSettings.getDisableCam();
      disableMyMic = lockAppliesToMe && lockSettings.getDisableMic();
      disableMyPrivateChat = lockAppliesToMe && lockSettings.getDisablePrivateChat();
      disableMyPublicChat = lockAppliesToMe && lockSettings.getDisablePublicChat();
      lockedLayout = lockAppliesToMe && lockSettings.getLockedLayout();
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new LockControlEvent(LockControlEvent.CHANGED_LOCK_SETTINGS));
            
      if (lockAppliesToMe) {
        //If it's sharing webcam, stop it
        if (disableMyCam && hasStream){
          dispatcher.dispatchEvent(new ClosePublishWindowEvent());
        }
        //If it's sharing microphone, mute it
        if (disableMyMic && !UserManager.getInstance().getConference().isMyVoiceMuted()) {
          var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
          e.userid = UsersUtil.getMyUserID();
          e.mute = true;
          dispatcher.dispatchEvent(e);
        }
      }
    }
  }
}
