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
			connectionSuccessSignal.dispatch();
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
			
			var username:String = _conferenceParameters.username;
			var role:String = _conferenceParameters.role;
			var intMeetingId:String = _conferenceParameters.room;
			var voiceConf:String = _conferenceParameters.voicebridge;
			var recorded:Boolean = _conferenceParameters.record;
			var extUserId:String = _conferenceParameters.externUserID;
			var intUserId:String = _conferenceParameters.internalUserID;
			var muteOnStart:Boolean = _conferenceParameters.muteOnStart;
			var guest:Boolean = false; // false for now because no guest support
			var authToken:String = _conferenceParameters.authToken;
			
			var connectParams:Array = [username, role, intMeetingId, voiceConf, recorded, extUserId, intUserId, muteOnStart, guest, authToken];
			
			trace("BBB Apps connect: " + connectParams);
			baseConnection.connect.apply(null, new Array(uri).concat(connectParams));
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			baseConnection.disconnect(onUserCommand);
		}
		
		/**** NEED TO REMOVE THIS BEFORE CONVERSION IS FINISHED ******/
		public function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object = null):void {
			//baseConnection.sendMessage(service, onSuccess, onFailure, message);
		}
		
		public function sendMessage2x(onSuccess:Function, onFailure:Function, message:Object):void {
			baseConnection.sendMessage2x(onSuccess, onFailure, message);
		}
	}
}
