package org.bigbluebutton.lib.screenshare.services
{

	import flash.net.NetConnection;
	
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
	}
}