package org.bigbluebutton.lib.common.services {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.ConnectionFailedEvent;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class BaseConnection implements IBaseConnection {
		private const LOG:String = "BaseConnection::";
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		protected var _connectionSuccessSignal:ISignal = new Signal();
		
		protected var _connectionFailureSignal:ISignal = new Signal();
		
		protected var _netConnection:NetConnection;
		
		protected var _uri:String;
		
		protected var _onUserCommand:Boolean;
		
    
		public function BaseConnection() {
		}
		
		public function init(callback:DefaultConnectionCallback):void {
			_netConnection = new NetConnection();
			_netConnection.client = callback;
			_netConnection.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			_netConnection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, netASyncError);
			_netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, netSecurityError);
			_netConnection.addEventListener(IOErrorEvent.IO_ERROR, netIOError);
		}
		
		public function get connectionFailureSignal():ISignal {
			return _connectionFailureSignal;
		}
		
		public function get connectionSuccessSignal():ISignal {
			return _connectionSuccessSignal;
		}
		
		public function get connection():NetConnection {
			return _netConnection;
		}
		
		public function connect(uri:String, ... parameters):void {
			_uri = uri;
			
			try {
				trace("Trying to connect to [" + uri + "] ...");
				trace("parameters: " + parameters);
				// passing an array to a method that expects a variable number of parameters
				// http://stackoverflow.com/a/3852920
				_netConnection.connect.apply(null, new Array(uri).concat(parameters));
			} catch (e:ArgumentError) {
				trace(ObjectUtil.toString(e));
				// Invalid parameters.
				switch (e.errorID) {
					case 2004:
						trace(LOG + "Error! Invalid server location: " + uri);
						break;
					default:
						trace(LOG + "UNKNOWN Error! Invalid server location: " + uri);
						break;
				}
				sendConnectionFailedSignal(e.message);
			}
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			_onUserCommand = onUserCommand;
			_netConnection.removeEventListener(NetStatusEvent.NET_STATUS, netStatus);
			_netConnection.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, netASyncError);
			_netConnection.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, netSecurityError);
			_netConnection.removeEventListener(IOErrorEvent.IO_ERROR, netIOError);
			_netConnection.close();
		}
		
		protected function netStatus(event:NetStatusEvent):void {
			var info:Object = event.info;
			var statusCode:String = info.code;
			switch (statusCode) {
				case "NetConnection.Connect.Success":
					trace(LOG + " Connection succeeded. Uri: " + _uri);
					sendConnectionSuccessEvent();
					break;
				case "NetConnection.Connect.Failed":
					trace(LOG + " Connection failed. Uri: " + _uri);
					sendConnectionFailedSignal(ConnectionFailedEvent.CONNECTION_FAILED);
					break;
				case "NetConnection.Connect.Closed":
					trace(LOG + " Connection closed. Uri: " + _uri);
					sendConnectionFailedSignal(ConnectionFailedEvent.CONNECTION_CLOSED);
					break;
				case "NetConnection.Connect.InvalidApp":
					trace(LOG + " application not found on server. Uri: " + _uri);
					sendConnectionFailedSignal(ConnectionFailedEvent.INVALID_APP);
					break;
				case "NetConnection.Connect.AppShutDown":
					trace(LOG + " application has been shutdown. Uri: " + _uri);
					sendConnectionFailedSignal(ConnectionFailedEvent.APP_SHUTDOWN);
					break;
				case "NetConnection.Connect.Rejected":
					trace(LOG + " Connection to the server rejected. Uri: " + _uri + ". Check if the red5 specified in the uri exists and is running");
					sendConnectionFailedSignal(ConnectionFailedEvent.CONNECTION_REJECTED);
					break;
				case "NetConnection.Connect.NetworkChange":
					trace("Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
					break;
				default:
					trace(LOG + " Default status");
					sendConnectionFailedSignal(ConnectionFailedEvent.UNKNOWN_REASON);
					break;
			}
		}
		
		protected function sendConnectionSuccessEvent():void {
			connectionSuccessSignal.dispatch();
		}
		
		protected function sendConnectionFailedSignal(reason:String):void {
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_CONNECTION_DROPPED);
		}
		
		protected function netSecurityError(event:SecurityErrorEvent):void {
			trace(LOG + "Security error - " + event.text);
			sendConnectionFailedSignal(ConnectionFailedEvent.UNKNOWN_REASON);
		}
		
		protected function netIOError(event:IOErrorEvent):void {
			trace(LOG + "Input/output error - " + event.text);
			sendConnectionFailedSignal(ConnectionFailedEvent.UNKNOWN_REASON);
		}
		
		protected function netASyncError(event:AsyncErrorEvent):void {
			trace(LOG + "Asynchronous code error - " + event.error + " on " + _uri);
      		trace(event.toString());
			sendConnectionFailedSignal(ConnectionFailedEvent.UNKNOWN_REASON);
		}
		
		public function sendMessage2x(onSuccess:Function, onFailure:Function, message:Object):void {
			if (message && message.header && message.body && message.header.name) {
				var responder:Responder = new Responder(
					function(result:Object):void { // On successful result
						onSuccess("Successfully sent [" + message.header.name + "]."); 
					},
					function(status:Object):void { // status - On error occurred
						var errorReason:String = "Failed to send [" + message.header.name + "]:\n"; 
						for (var x:Object in status) { 
							errorReason += "\t" + x + " : " + status[x]; 
						} 
					}
				);
			
				_netConnection.call("onMessageFromClient", responder, JSON.stringify(message));
			}
		}
	}
}
