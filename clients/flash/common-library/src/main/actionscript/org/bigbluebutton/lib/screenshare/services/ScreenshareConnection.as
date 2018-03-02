package org.bigbluebutton.lib.screenshare.services
{

	import flash.net.NetConnection;
	import flash.net.Responder;
	
	import org.bigbluebutton.lib.common.services.DefaultConnectionCallback;
	import org.bigbluebutton.lib.common.services.IBaseConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class ScreenshareConnection extends DefaultConnectionCallback implements IScreenshareConnection
	{
		private const LOG:String = "ScreenshareConnection::";
		
		[Inject]
		public var baseConnection:IBaseConnection;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		protected var _connectionSuccessSignal:ISignal = new Signal();
		
		protected var _connectionFailureSignal:ISignal = new Signal();
		
		protected var _applicationURI:String;
				
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
			trace("SCREENSHARE CONNECTION SUCCESS");
			connectionSuccessSignal.dispatch();
		}
		
		public function get connectionFailureSignal():ISignal {
			trace("SCREENSHARE CONNECTION FAILED");
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
		
		public function connect():void {
			var ssUri:String = _applicationURI + "/" + conferenceParameters.meetingID
			trace("Screenshare connect to " + ssUri);
			baseConnection.connect(ssUri, null);
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			baseConnection.disconnect(onUserCommand);
		}
		
		private function sendUserIdToServer():void {
			var message:Object = new Object();
			message["meetingId"] = conferenceParameters.meetingID;
			message["userId"] = conferenceParameters.internalUserID;
			
			sendMessage("screenshare.setUserId", defaultSuccessResponse, defaultFailureResponse, message);
			
		}
		
		public function isScreenSharing(meetingId:String):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			
			sendMessage("screenshare.isScreenSharing", defaultSuccessResponse, defaultFailureResponse, message);
			
		}
		
		private function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object):void {
			trace("SENDING [" + service + "]");
			baseConnection.sendMessageAsObject(service, onSuccess, onFailure, message);
		}
		
		public function restartShareRequest(meetingId:String, userId:String):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["userId"] = userId;
			
			sendMessage("screenshare.restartShareRequest", defaultSuccessResponse, defaultFailureResponse, message);
			
		}
		
		public function pauseShareRequest(meetingId:String, userId:String, streamId:String):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["userId"] = userId;
			message["streamId"] = streamId;
			
			sendMessage("screenshare.pauseShareRequest", defaultSuccessResponse, defaultFailureResponse, message);
			
		}
		
		public function requestShareToken(meetingId:String, userId:String, record:Boolean, tunnel: Boolean):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["userId"] = userId;
			message["record"] = record;
			message["tunnel"] = tunnel;
			
			sendMessage("screenshare.requestShareToken", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function startShareRequest(meetingId:String, userId:String, session:String):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["userId"] = userId;
			message["session"] = session;
			
			sendMessage("screenshare.startShareRequest", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function stopShareRequest(meetingId:String, streamId:String):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["streamId"] = streamId;
			
			sendMessage("screenshare.stopShareRequest", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function sendClientPongMessage(meetingId:String, session:String, timestamp: Number):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["session"] = session;
			message["timestamp"] = timestamp;
			
			sendMessage("screenshare.screenShareClientPongMessage", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		private var defaultSuccessResponse:Function = function(result:String):void {
			trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			trace(status);
		};
	}
}