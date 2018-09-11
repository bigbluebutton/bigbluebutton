package org.bigbluebutton.air.screenshare.services {
	
	import flash.net.NetConnection;
	
	import org.bigbluebutton.air.common.services.DefaultConnectionCallback;
	import org.bigbluebutton.air.common.services.IBaseConnection;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ScreenshareConnection extends DefaultConnectionCallback implements IScreenshareConnection {
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
			//trace("SCREENSHARE CONNECTION FAILED");
			connectionFailureSignal.dispatch(reason);
		}
		
		private function onConnectionSuccess():void {
			//trace("SCREENSHARE CONNECTION SUCCESS");
			sendUserIdToServer();
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
		
		public function isTunnelling():Boolean {
			return baseConnection.isTunnelling();
		}
		
		public function connect():void {
			var ssUri:String = _applicationURI + "/" + conferenceParameters.meetingID
			//trace("Screenshare connect to " + ssUri);
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
			//trace("SCREENSHARE: screenshare.isScreenSharing for" + meetingId);
			sendMessage("screenshare.isScreenSharing", defaultSuccessResponse, defaultFailureResponse, message);
		
		}
		
		private function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object):void {
			//trace("SENDING [" + service + "]");
			baseConnection.sendMessageAsObject(service, onSuccess, onFailure, message);
		}
		
		private var defaultSuccessResponse:Function = function(result:String):void {
			//trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			//trace(status);
		};
	}
}
