package org.bigbluebutton.air.deskshare.services {
	
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.air.common.services.DefaultConnectionCallback;
	import org.bigbluebutton.air.common.services.IBaseConnection;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class DeskshareConnection extends DefaultConnectionCallback implements IDeskshareConnection {
		private const LOG:String = "DeskshareConnection::";
		
		[Inject]
		public var baseConnection:IBaseConnection;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		private var _connectionSuccess:ISignal = new Signal();
		
		private var _connectionFailure:ISignal = new Signal();
		
		private var _isStreamingSignal:ISignal = new Signal();
		
		private var _mouseLocationChangedSignal:ISignal = new Signal();
		
		private var _isStreaming:Boolean;
		
		private var _streamWidth:Number;
		
		private var _streamHeight:Number;
		
		private var _applicationURI:String;
		
		private var _room:String;
		
		private var _deskSO:SharedObject;
		
		public function DeskshareConnection() {
		}
		
		[PostConstruct]
		public function init():void {
			baseConnection.init(this);
			baseConnection.connectionSuccessSignal.add(onConnectionSuccess);
			baseConnection.connectionFailureSignal.add(onConnectionFailure);
		}
		
		public function onConnectionSuccess():void {
			_deskSO = SharedObject.getRemote(room + "-deskSO", applicationURI, false);
			_deskSO.client = this;
			_deskSO.connect(baseConnection.connection);
			checkIfStreamIsPublishing();
			_connectionSuccess.dispatch();
		}
		
		private function checkIfStreamIsPublishing():void {
			baseConnection.connection.call("deskshare.checkIfStreamIsPublishing", new Responder(function(result:Object):void {
				if (result != null && (result.publishing as Boolean)) {
					streamHeight = result.height as Number;
					streamWidth = result.width as Number;
					
					trace("Deskshare stream is streaming [" + streamWidth + "," + streamHeight + "]");
					
					// if we receive result from the server, then somebody is sharing their desktop - dispatch the notification signal
					isStreaming = true;
				} else {
					trace("No deskshare stream being published");
				}
			}, function(status:Object):void {
				trace("Error while trying to call remote method on the server");
			}), _room);
		}
		
		public function onConnectionFailure(reason:String):void {
			_connectionFailure.dispatch(reason);
		}
		
		public function get applicationURI():String {
			return _applicationURI;
		}
		
		public function set applicationURI(value:String):void {
			_applicationURI = value;
		}
		
		public function get streamWidth():Number {
			return _streamWidth;
		}
		
		public function set streamWidth(value:Number):void {
			_streamWidth = value;
		}
		
		public function get streamHeight():Number {
			return _streamHeight;
		}
		
		public function set streamHeight(value:Number):void {
			_streamHeight = value;
		}
		
		public function get room():String {
			return _room;
		}
		
		public function set room(value:String):void {
			_room = value;
		}
		
		public function get connection():NetConnection {
			return baseConnection.connection;
		}
		
		public function connect():void {
      trace("Deskshare connect");
			//baseConnection.connect(applicationURI);
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			baseConnection.disconnect(onUserCommand);
		}
		
		public function get isStreaming():Boolean {
			return _isStreaming;
		}
		
		public function set isStreaming(value:Boolean):void {
			_isStreaming = value;
			isStreamingSignal.dispatch(_isStreaming);
		}
		
		public function get isStreamingSignal():ISignal {
			return _isStreamingSignal;
		}
		
		public function get mouseLocationChangedSignal():ISignal {
			return _mouseLocationChangedSignal;
		}
		
		public function get connectionFailureSignal():ISignal {
			return _connectionFailure;
		}
		
		public function get connectionSuccessSignal():ISignal {
			return _connectionSuccess;
		}
		
		public function appletStarted(videoWidth:Number, videoHeight:Number):void {
			trace(LOG + "appletStarted() sharing.");
		}
		
		/**
		 * Called by the server when a notification is received to start viewing the broadcast stream.
		 * This method is called on successful execution of sendStartViewingNotification()
		 *
		 */
		public function startViewing(videoWidth:Number, videoHeight:Number):void {
			trace(LOG + "startViewing()");
			streamWidth = videoWidth;
			streamHeight = videoHeight;
			isStreaming = true;
		}
		
		/**
		 * Called by the server to notify clients that the deskshare stream has stopped.
		 */
		public function deskshareStreamStopped():void {
			trace(LOG + "deskshareStreamStopped()");
			isStreaming = false;
		}
		
		/**
		 * Called by the server to notify clients that mouse location has changed
		 */
		public function mouseLocationCallback(x:Number, y:Number):void {
			_mouseLocationChangedSignal.dispatch(x, y);
		}
	}
}
