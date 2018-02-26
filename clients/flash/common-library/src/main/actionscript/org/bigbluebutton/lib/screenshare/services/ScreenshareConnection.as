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
		
		public function ScreenshareConnection()
		{
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
			connectionSuccessSignal.dispatch();
		}
		
		public function get connectionFailureSignal():ISignal {
			return _connectionFailureSignal;
		}
		
		public function get connectionSuccessSignal():ISignal {
			return _connectionSuccessSignal;
		}
		
		public function get connection():NetConnection {
			return baseConnection.connection;
		}
		
		public function connect():void {
			trace("Screenshare connect");
	//		baseConnection.connect(uri, conferenceParameters.meetingID);
		}
		
		public function disconnect(onUserCommand:Boolean):void {
			baseConnection.disconnect(onUserCommand);
		}
	}
}