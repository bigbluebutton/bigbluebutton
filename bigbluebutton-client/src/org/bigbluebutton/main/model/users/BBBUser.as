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
	
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.events.LockControlEvent;
	import org.bigbluebutton.core.events.VoiceConfEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.core.vo.LockSettingsVO;
	import org.bigbluebutton.main.model.users.events.ChangeStatusEvent;
	import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
	import org.bigbluebutton.main.model.users.events.StreamStoppedEvent;
	import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	
	public class BBBUser {
		public static const MODERATOR:String = "MODERATOR";
		public static const VIEWER:String = "VIEWER";
		public static const PRESENTER:String = "PRESENTER";
		
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
    
		[Bindable] public var waitingForMod:Boolean = false;
		[Bindable] public var guest:Boolean;
		[Bindable] public var acceptedJoin:Boolean = false;

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
            trace("Before adding the stream " + streamName + ": " + _viewingStream);
            if (isViewingStream(streamName)) {
                return false;
            }

            _viewingStream.push(streamName);
            trace("After adding the stream " + streamName + ": " + _viewingStream);
            return true;
        }
        public function removeViewingStream(streamName:String):Boolean {
            trace("Before removing the stream " + streamName + ": " + _viewingStream);
            if (!isViewingStream(streamName)) {
                return false;
            }

            _viewingStream = _viewingStream.filter(function(item:*, index:int, array:Array):Boolean { return item != streamName; });
            trace("After removing the stream " + streamName + ": " + _viewingStream);
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
		
		private var _mood:String = ChangeStatusEvent.CLEAR_STATUS;
		public function get hasMood():Boolean {
			return _mood != ChangeStatusEvent.CLEAR_STATUS;
		}
		[Bindable]
		public function get mood():String {
			return _mood;
		}
		public function set mood(m:String):void {
			_mood = m;
			verifyUserStatus();
		}
		[Bindable]
		public function get raiseHand():Boolean {
			return _mood == ChangeStatusEvent.RAISE_HAND;
		}
		public function set raiseHand(r:Boolean):void {
			mood = (r? ChangeStatusEvent.RAISE_HAND: ChangeStatusEvent.CLEAR_STATUS);
		}
		
		private var _moodTimestamp:Number = 0;
		[Bindable]
		public function get moodTimestamp():Number {
			return _moodTimestamp;
		}
		public function set moodTimestamp(t:Number):void {
			_moodTimestamp = t;
		}
		
		private var _role:String = Role.VIEWER;
		[Bindable] 
		public function get role():String {
			return _role;
		}
		public function set role(r:String):void {
			_role = r;
			moderator = _role == MODERATOR;
			verifyUserStatus();
			if (me) {
				applyLockSettings();
			}
		}

		[Bindable] public var moderator:Boolean = false;

		[Bindable] public var room:String = "";
		[Bindable] public var authToken:String = "";
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
			else if (hasMood) {
				_userStatus = moodStatus;
			} else {
				_userStatus = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.viewer');
			}
		}
		private function get moodStatus():String {
			var s:String = "";
			switch(mood) {
				case ChangeStatusEvent.RAISE_HAND:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.handRaised');
					break;
				case ChangeStatusEvent.AGREE:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.agree');
					break;
				case ChangeStatusEvent.DISAGREE:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.disagree');
					break;
				case ChangeStatusEvent.SPEAK_LOUDER:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.speakLouder');
					break;
				case ChangeStatusEvent.SPEAK_LOWER:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.speakSofter');
					break;
				case ChangeStatusEvent.SPEAK_FASTER:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.speakFaster');
					break;
				case ChangeStatusEvent.SPEAK_SLOWER:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.speakSlower');
					break;
				case ChangeStatusEvent.BE_RIGHT_BACK:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.beRightBack');
					break;
				case ChangeStatusEvent.LAUGHTER:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.laughter');
					break;
				case ChangeStatusEvent.SAD:
					s = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer.sad');
					break;
			}
			return s;
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
			
		public function buildStatus():void{
			var showingWebcam:String = "";
			var isPresenter:String = "";
			var handRaised:String = "";
			if (hasStream)
				showingWebcam = ResourceUtil.getInstance().getString('bbb.viewers.viewersGrid.statusItemRenderer.streamIcon.toolTip');
			if (presenter)
				isPresenter = ResourceUtil.getInstance().getString('bbb.viewers.viewersGrid.statusItemRenderer.presIcon.toolTip');
			if (hasMood)
				handRaised = moodStatus;
			
			status = showingWebcam + isPresenter + handRaised;
		}
	
		public function addStatus(status:Status):void {
			_status.addStatus(status);
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
      sendStreamStoppedEvent(stream);
      buildStatus();
      verifyMedia();
    }
    
    public function presenterStatusChanged(presenter: Boolean):void {
      this.presenter = presenter;
      buildStatus();
    }
    
    public function lockStatusChanged(locked: Boolean):void {
      userLocked = locked;
      if(me)
        applyLockSettings();
      buildStatus();
    }
    
		public function changeStatus(status:Status):void {
			//_status.changeStatus(status);
			if (status.name == "presenter") {
				presenter = status.value
			}
			switch (status.name) {
				case "locked":
					userLocked = status.value as Boolean;
					if(me)
						applyLockSettings();
					break;
				case "presenter":
					presenter = status.value;
					break;
				case "hasStream":
					var streamInfo:Array = String(status.value).split(/,/);
					/**
					 * Cannot use this statement as new Boolean(expression)
					 * return true if the expression is a non-empty string not
					 * when the string equals "true". See Boolean class def.
					 *
					 * hasStream = new Boolean(String(streamInfo[0]));
					 */
					var streamNameInfo:Array = String(streamInfo[1]).split(/=/);
					streamName = streamNameInfo[1];
					break;
				case "mood":
					trace("New mood received: " + status.value);
					var moodValue:String = String(status.value);
					if (moodValue == "") {
						trace("Empty mood, assuming CLEAR_STATUS");
						moodValue = ChangeStatusEvent.CLEAR_STATUS;
						moodTimestamp = 0;
					} else {
						var valueSplit:Array = moodValue.split(",");
						moodValue = valueSplit[0];
						moodTimestamp = Number(valueSplit[1]);
					}
					mood = moodValue;
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
	
		public static function copy(user:BBBUser):BBBUser {
			var n:BBBUser = new BBBUser();
			n.authToken = user.authToken;
			n.me = user.me;
			n.userID = user.userID;
			n.externUserID = user.externUserID;
			n.name = user.name;
            n._viewingStream = user._viewingStream;
			n.streamNames = user.streamNames;
			n.presenter = user.presenter;
			n.mood = user.mood;
			n.moodTimestamp = user.moodTimestamp;
			n._role = user._role;
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
			n.guest = user.guest;

			return n;		
		}

		private function sendStreamStartedEvent(stream: String):void{
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new StreamStartedEvent(userID, name, stream));
		}

		private function sendStreamStoppedEvent(stream:String):void{
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new StreamStoppedEvent(userID, name, stream));
		}

		public function applyLockSettings():void {
       
			var lockSettings:LockSettingsVO = UserManager.getInstance().getConference().getLockSettings();
			
			disableMyCam = lockSettings.getDisableCam();
			disableMyMic = lockSettings.getDisableMic();
			disableMyPrivateChat = lockSettings.getDisablePrivateChat();
			disableMyPublicChat = lockSettings.getDisablePublicChat();
      lockedLayout = lockSettings.getLockedLayout();
      
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new LockControlEvent(LockControlEvent.CHANGED_LOCK_SETTINGS));
			
      if (me && role != MODERATOR && !presenter) {
  			//If it's sharing webcam, stop it
  			if (disableMyCam && hasStream){
  				dispatcher.dispatchEvent(new ClosePublishWindowEvent());
  			}
  			
  			//If it's sharing microphone, mute it
  			if (disableMyMic && !UserManager.getInstance().getConference().isMyVoiceMuted()) {
  				var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
  				e.userid = UserManager.getInstance().getConference().getMyUserId();
  				e.mute = true;
  				dispatcher.dispatchEvent(e);
  			}
      }
		}
	}
}
