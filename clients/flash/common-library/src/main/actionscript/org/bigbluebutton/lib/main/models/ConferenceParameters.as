package org.bigbluebutton.lib.main.models {
	
	import flash.net.NetConnection;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	/**
	 * The ConferenceParameters class holds attributes that define the conference. You can access them in your module through the
	 * attributes property that is passed to your IBigBlueButtonModule instance on startup.
	 *
	 */
	public class ConferenceParameters implements IConferenceParameters {
		private var _changedSignal:Signal;
		
		private var _meetingName:String;
		
		private var _externMeetingID:String;
		
		/**
		 * The name of the conference
		 */
		private var _conference:String;
		
		/**
		 * The username of the local user
		 */
		private var _username:String;
		
		/**
		 * The role of the local user. Could be MODERATOR or VIEWER
		 */
		private var _role:String;
		
		/**
		 * The room unique id, as specified in the API /create call.
		 */
		private var _room:String;
		
		/**
		 * Voice conference bridge for the client
		 */
		private var _webvoiceconf:String;
		
		/**
		 * Voice conference bridge that external SIP clients use. Usually the same as webvoiceconf
		 */
		private var _voicebridge:String;
		
		/**
		 *  The welcome string, as passed in through the API /create call.
		 */
		private var _welcome:String;
		
		private var _meetingID:String;
		
		/**
		 * External unique user id.
		 */
		private var _externUserID:String;
		
		/**
		 * Internal unique user id.
		 */
		private var _internalUserID:String;
		
		private var _logoutUrl:String;
		
		/**
		 * A flash.net.NetConnection object that bbb-client connects to on startup. This connection reference is
		 * passed to your module as an already open connection. Use it to talk to the bigbluebutton server.
		 */
		private var _connection:NetConnection;
		
		private var _record:Boolean;
		
		private var _authToken:String;
		
		private var _metadata:Object;
		
		private var _muteOnStart:Boolean;
		
		private var _avatarUrl:String;
		
		public function ConferenceParameters(signal:Signal = null) {
			if (signal) {
				_changedSignal = signal;
			} else {
				_changedSignal = new Signal();
			}
		}
		
		/**
		 * Dispatched when the collection is
		 * changed.
		 */
		public function get changedSignal():ISignal {
			return _changedSignal;
		}
		
		public function get meetingName():String {
			return _meetingName;
		}
		
		public function set meetingName(meetingName:String):void {
			_meetingName = meetingName;
			_changedSignal.dispatch();
		}
		
		public function get externMeetingID():String {
			return _externMeetingID;
		}
		
		public function get meetingID():String {
			return _meetingID;
		}
		
		public function set externMeetingID(externMeetingID:String):void {
			_externMeetingID = externMeetingID;
			_changedSignal.dispatch();
		}
		
		public function get conference():String {
			return _conference;
		}
		
		public function set conference(conference:String):void {
			_conference = conference;
			_changedSignal.dispatch();
		}
		
		public function get username():String {
			return _username;
		}
		
		public function set username(username:String):void {
			_username = username;
			_changedSignal.dispatch();
		}
		
		public function get role():String {
			return _role;
		}
		
		public function set role(role:String):void {
			_role = role;
			_changedSignal.dispatch();
		}
		
		public function get room():String {
			return _room;
		}
		
		public function set room(room:String):void {
			_room = room;
			_changedSignal.dispatch();
		}
		
		public function get webvoiceconf():String {
			return _webvoiceconf;
		}
		
		public function set webvoiceconf(webvoiceconf:String):void {
			_webvoiceconf = webvoiceconf;
			_changedSignal.dispatch();
		}
		
		public function get voicebridge():String {
			return _voicebridge;
		}
		
		public function set voicebridge(voicebridge:String):void {
			_voicebridge = voicebridge;
			_changedSignal.dispatch();
		}
		
		public function get welcome():String {
			return _welcome;
		}
		
		public function set welcome(welcome:String):void {
			_welcome = welcome;
			_changedSignal.dispatch();
		}
		
		public function get externUserID():String {
			return _externUserID;
		}
		
		public function set externUserID(externUserID:String):void {
			_externUserID = externUserID;
			_changedSignal.dispatch();
		}
		
		public function get internalUserID():String {
			return _internalUserID;
		}
		
		public function set internalUserID(internalUserID:String):void {
			_internalUserID = internalUserID;
			_changedSignal.dispatch();
		}
		
		public function get logoutUrl():String {
			return _logoutUrl;
		}
		
		public function set logoutUrl(logoutUrl:String):void {
			_logoutUrl = logoutUrl;
			_changedSignal.dispatch();
		}
		
		public function get connection():NetConnection {
			return _connection;
		}
		
		public function set connection(connection:NetConnection):void {
			_connection = connection;
			_changedSignal.dispatch();
		}
		
		public function get record():Boolean {
			return _record;
		}
		
		public function set record(record:Boolean):void {
			_record = record;
			_changedSignal.dispatch();
		}
		
		public function get authToken():String {
			return _authToken;
		}
		
		public function set authToken(authToken:String):void {
			_authToken = authToken;
		}
		
		public function get metadata():Object {
			return _metadata;
		}
		
		public function set metadata(metadata:Object):void {
			metadata = metadata;
		}
		
		public function load(obj:Object):void {
			_meetingName = obj.conferenceName;
			_externMeetingID = obj.externMeetingID;
			_conference = obj.conference;
			_username = obj.username;
			_role = obj.role;
			_room = obj.room;
			_webvoiceconf = obj.webvoiceconf;
			_voicebridge = obj.voicebridge;
			_welcome = obj.welcome;
			_meetingID = obj.meetingID;
			_externUserID = obj.externUserID;
			_internalUserID = obj.internalUserId;
			_logoutUrl = obj.logoutUrl;
			_record = !(obj.record == "false");
			_avatarUrl = obj.avatarURL;
			_authToken = obj.authToken;
			_changedSignal.dispatch();
			_metadata = new Object();
			for (var n:String in obj.metadata) {
				for (var id:String in obj.metadata[n]) {
					_metadata[id] = obj.metadata[n][id];
				}
			}
			try {
				_muteOnStart = (obj.muteOnStart as String).toUpperCase() == "TRUE";
			} catch (e:Error) {
				_muteOnStart = false;
			}
			for (var key:String in obj) {
				var value:Object = obj[key];
				trace(key + " = " + value);
			}
		}
		
		public function set muteOnStart(mute:Boolean):void {
			_muteOnStart = mute;
		}
		
		public function get muteOnStart():Boolean {
			return _muteOnStart;
		}
		
		public function get avatarUrl():String {
			return _avatarUrl;
		}
		
		public function set avatarUrl(value:String):void {
			_avatarUrl = value;
		}
	}
}
