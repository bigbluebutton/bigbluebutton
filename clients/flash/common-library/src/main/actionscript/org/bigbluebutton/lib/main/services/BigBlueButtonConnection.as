package org.bigbluebutton.lib.main.services {
	
	import flash.net.NetConnection;
	import flash.net.Responder;
	import mx.utils.ObjectUtil;
	import org.bigbluebutton.lib.common.services.DefaultConnectionCallback;
	import org.bigbluebutton.lib.common.services.IBaseConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class BigBlueButtonConnection extends DefaultConnectionCallback implements IBigBlueButtonConnection {
		public static const NAME:String = "BigBlueButtonConnection";
		
		protected var _connectionSuccessSignal:ISignal = new Signal();
		
		protected var _connectionFailureSignal:ISignal = new Signal();
		
		[Inject]
		public var baseConnection:IBaseConnection;
		
		private var _applicationURI:String;
		
		private var _conferenceParameters:IConferenceParameters;
		
		private var _tried_tunneling:Boolean = false;
		
		private var _userId:String;
		
		[PostConstruct]
		public function init():void {
			baseConnection.init(this);
			baseConnection.connectionSuccessSignal.add(onConnectionSuccess);
			baseConnection.connectionFailureSignal.add(onConnectionFailure);
		}
		
		private function onConnectionFailure(reason:String):void {
			connectionFailureSignal.dispatch(reason);
		}
		
		private function onConnectionSuccess():void {
			getMyUserId();
		}
		
		private function getMyUserId():void {
			baseConnection.connection.call("participants.getMyUserId", new Responder(function(result:String):void {
				trace("Success connected: My user ID is [" + result + "]");
				_userId = result;
				connectionSuccessSignal.dispatch();
			}, function(status:Object):void {
				trace("Error occurred");
				trace(ObjectUtil.toString(status));
				connectionFailureSignal.dispatch("Failed to get the userId");
			}));
		}
		
		public function get connectionFailureSignal():ISignal {
			return _connectionFailureSignal;
		}
		
		public function get connectionSuccessSignal():ISignal {
			return _connectionSuccessSignal;
		}
		
		public function set uri(uri:String):void {
			_applicationURI = uri;
		}
		
		public function get uri():String {
			return _applicationURI;
		}
		
		public function get connection():NetConnection {
			return baseConnection.connection;
		}
		
		/**
		 * Connect to the server.
		 * uri: The uri to the conference application.
		 * username: Fullname of the participant.
		 * role: MODERATOR/VIEWER
		 * conference: The conference room
		 * mode: LIVE/PLAYBACK - Live:when used to collaborate, Playback:when being used to playback a recorded conference.
		 * room: Need the room number when playing back a recorded conference. When LIVE, the room is taken from the URI.
		 */
		public function connect(params:IConferenceParameters, tunnel:Boolean = false):void {
			_conferenceParameters = params;
			_tried_tunneling = tunnel;
			var uri:String = _applicationURI + "/" + _conferenceParameters.room;
			var lockSettings:Object = {disableCam: false, disableMic: false, disablePrivateChat: false, disablePublicChat: false, lockedLayout: false, lockOnJoin: false, lockOnJoinConfigurable: false};
			var connectParams:Array = [_conferenceParameters.username, _conferenceParameters.role, _conferenceParameters.room, _conferenceParameters.voicebridge, _conferenceParameters.record, _conferenceParameters.externUserID, _conferenceParameters.internalUserID, _conferenceParameters.muteOnStart, lockSettings];
			trace("BBB Apps connect: " + connectParams);
			baseConnection.connect.apply(null, new Array(uri).concat(connectParams));
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			baseConnection.disconnect(onUserCommand);
		}
		
		public function get userId():String {
			return _userId;
		}
		
		public function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object = null):void {
			baseConnection.sendMessage(service, onSuccess, onFailure, message);
		}
	}
}
