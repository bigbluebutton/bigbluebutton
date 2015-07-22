package org.bigbluebutton.lib.voice.services {
	
	import flash.net.NetConnection;
	import flash.net.Responder;
	
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.common.services.DefaultConnectionCallback;
	import org.bigbluebutton.lib.common.services.IBaseConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class VoiceConnection extends DefaultConnectionCallback implements IVoiceConnection {
		public const LOG:String = "VoiceConnection::";
		
		[Inject]
		public var baseConnection:IBaseConnection;
		
		[Inject]
		public var userSession:IUserSession;
		
		public var _callActive:Boolean = false;
		
		protected var _connectionSuccessSignal:ISignal = new Signal();
		
		protected var _connectionFailureSignal:ISignal = new Signal();
		
		protected var _applicationURI:String;
		
		protected var _username:String;
		
		protected var _conferenceParameters:IConferenceParameters;
		
		public function VoiceConnection() {
		}
		
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
			call(userSession.userList.me.listenOnly);
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
		
		public function get callActive():Boolean {
			return _callActive;
		}
		
		public function connect(confParams:IConferenceParameters):void {
			// we don't use scope in the voice communication (many hours lost on it)
			_conferenceParameters = confParams;
			_username = encodeURIComponent(confParams.externUserID + "-bbbID-" + confParams.username);
			baseConnection.connect(_applicationURI, confParams.username, _username, confParams.externMeetingID);
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			baseConnection.disconnect(onUserCommand);
		}
		
		//**********************************************//
		//												//
		//			CallBack Methods from Red5			//
		//												//
		//**********************************************//
		public function failedToJoinVoiceConferenceCallback(msg:String):* {
			trace(LOG + "failedToJoinVoiceConferenceCallback(): " + msg);
			connectionFailureSignal.dispatch("Failed on failedToJoinVoiceConferenceCallback()");
		}
		
		public function disconnectedFromJoinVoiceConferenceCallback(msg:String):* {
			trace(LOG + "disconnectedFromJoinVoiceConferenceCallback(): " + msg);
			connectionFailureSignal.dispatch("Failed on disconnectedFromJoinVoiceConferenceCallback()");
			//hangUp();
		}
		
		public function successfullyJoinedVoiceConferenceCallback(publishName:String, playName:String, codec:String):* {
			trace(LOG + "successfullyJoinedVoiceConferenceCallback()");
			connectionSuccessSignal.dispatch(publishName, playName, codec);
		}
		
		//**********************************************//
		//												//
		//					SIP Actions					//
		//												//
		//**********************************************//
		public function call(listenOnly:Boolean = false):void {
			if (!callActive) {
				trace(LOG + "call(): starting voice call");
				baseConnection.connection.call(
					"voiceconf.call",
					new Responder(onCallSuccess, onCallFailure),
					"default",
					_username,
					_conferenceParameters.webvoiceconf,
					listenOnly.toString()
					);
			} else {
				trace(LOG + "call(): voice call already active");
			}
		}
		
		private function onCallSuccess(result:Object):void {
			trace(LOG + "onCallSuccess(): " + ObjectUtil.toString(result));
			_callActive = true;
		}
		
		private function onCallFailure(status:Object):void {
			trace(LOG + "onCallFailure(): " + ObjectUtil.toString(status));
			connectionFailureSignal.dispatch("Failed on call()");
			_callActive = false;
		}
		
		public function hangUp():void {
			if (callActive) {
				trace(LOG + "hangUp(): hanging up the voice call");
				baseConnection.connection.call(
					"voiceconf.hangup",
					new Responder(onHangUpSuccess, onHangUpFailure),
					"default"
					);
			} else {
				trace(LOG + "hangUp(): call already hung up");
			}
		}
		
		private function onHangUpSuccess(result:Object):void {
			trace(LOG + "onHangUpSuccess(): " + ObjectUtil.toString(result));
			_callActive = false;
		}
		
		private function onHangUpFailure(status:Object):void {
			trace(LOG + "onHangUpFailure: " + ObjectUtil.toString(status));
		}
	}
}
