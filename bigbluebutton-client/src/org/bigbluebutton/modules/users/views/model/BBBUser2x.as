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
package org.bigbluebutton.modules.users.views.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.Event;
  
  import org.as3commons.lang.ArrayUtils;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.main.model.users.Status;
  import org.bigbluebutton.main.model.users.StatusCollection;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class BBBUser2x {
    private static const LOGGER:ILogger = getClassLogger(BBBUser2x);
    
    public var dispatcher:Dispatcher = new Dispatcher();
    
    [Bindable] public var me: Boolean = false;
    
    [Bindable] public var userId:String = "UNKNOWN USER";
    [Bindable] public var name:String = "";  
    [Bindable] public var guest:Boolean = false;
    [Bindable] public var authed:Boolean = false;
    [Bindable] public var locked: Boolean = false;

    [Bindable] public var callingWith: String = "";
    [Bindable] public var talking: Boolean = false;
    [Bindable] public var listenOnly: Boolean = false;
    [Bindable] public var voiceOnlyUser: Boolean = false;
    
    [Bindable]
    public function get hasStream():Boolean {
      return _streamNames.length > 0;
    }
    public function set hasStream(s:Boolean):void {
      throw new Error("hasStream cannot be set. It is derived directly from streamName");
    }
    [Bindable]
    public var viewingStream:Array = new Array();
    
    public function isViewingAllStreams():Boolean {
      return viewingStream.length == _streamNames.length;
    }
    
    public function set viewedStream(streamIds: Array): void {
        if (streamIds != null) {
            viewingStream = streamIds;
        }
    }
    
    private var _streamNames:Array = new Array();
    
    [Bindable]
    public function get streams():Array {
      return _streamNames;
    }
    
    private function hasThisStream(streamName:String):Boolean {
        for each(var streamId:String in _streamNames) {
            if (streamId == streamName) return true;
        }
      return false; 
    }
    
    public function set streams(streamIds:Array):void {
      if (streamIds != null) {
          _streamNames = streamIds;
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
      return _emojiStatus != null && _emojiStatus != "none" && _emojiStatus != "null";
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
    
    private var _muted:Boolean = false;
    [Bindable]
    public function get muted():Boolean {
      return _muted;
    }
    public function set muted(v:Boolean):void {
      _muted = v;
      verifyMedia();
    }
    
    private var _inVoiceConf:Boolean = false;
    [Bindable] 
    public function get inVoiceConf():Boolean {
      return _inVoiceConf;
    }
    public function set inVoiceConf(v:Boolean):void {
      _inVoiceConf = v;
      verifyMedia();
    }
    
    [Bindable] public var status:String = "";
    
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
        (!inVoiceConf ? ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer.noAudio') : 
          (muted ? ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer.micOff') : 
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
        hasEmoji = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.'+ emojiStatus +'.toolTip');
      
      status = showingWebcam + isPresenter + hasEmoji;
    }
    
    public function addStatus(status:Status):void {
      _status.addStatus(status);
    }
    
    public function userEmojiStatus(emoji: String):void {
      emojiStatus = emoji;
      buildStatus();
    }
    
    public function sharedWebcam(stream: String):void {
      if(stream && stream != "" && !hasThisStream(stream)) {
        sendStreamStartedEvent(stream);
      }
      buildStatus();
      verifyMedia();
    }
    
    public function presenterStatusChanged(presenter: Boolean):void {
      this.presenter = presenter;
      buildStatus();
    }
    
    public function lockStatusChanged(locked: Boolean):void {
      this.locked = locked;
      buildStatus();
    }
    
    public function changeStatus(status:Status):void {
      switch (status.name) {
        case "presenter":
          presenter=(status.value.toString().toUpperCase() == "TRUE") ? true : false;
          break;
        // @FIXME : check the coming status from the server
        case "emojiStatus":
          emojiStatus = status.value.toString();
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
        
    private function sendStreamStartedEvent(stream: String):void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new StreamStartedEvent(userId, name, stream));
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
  }
}
