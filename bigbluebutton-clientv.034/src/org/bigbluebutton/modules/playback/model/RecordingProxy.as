package org.bigbluebutton.modules.playback.model
{
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.red5.Connection;
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class RecordingProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "Recording Proxy";
		
		private var conn:Connection;
		private var nc:NetConnection;
		private var recordingSO:SharedObject;
		private var uri:String;
		
		public function RecordingProxy(url:String)
		{
			super(NAME);
			conn = new Connection();
			this.uri = url;
			conn.addEventListener(Connection.SUCCESS, handleSuccessfulConnection);
			conn.addEventListener(Connection.FAILED, handleFailedConnection);
			conn.addEventListener(Connection.DISCONNECTED, handleDisconnection);
			conn.setURI(this.uri);
			conn.connect();
		}
		
		private function handleSuccessfulConnection(e:ConnectionEvent):void{
			nc = conn.getConnection();
		}
		
		private function handleFailedConnection(e:ConnectionEvent):void{
			
		}
		
		private function handleDisconnection(e:ConnectionEvent):void{
			
		}
		
		public function startRecording():void{
			
		}
		
		public function stopRecording():void{
			
		}

	}
}