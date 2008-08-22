package org.bigbluebutton.modules.playback.model
{
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.red5.Connection;
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class RecordingProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "Recording Proxy";
		public static const RECORDING_URL:String = "Recording URL";
		
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
			startRecording();
		}
		
		private function handleFailedConnection(e:ConnectionEvent):void{
			
		}
		
		private function handleDisconnection(e:ConnectionEvent):void{
			
		}
		
		public function startRecording():void{
			nc.call("VCRStart", new Responder(gotStart, gotFault), "85115");
		}
		
		public function stopRecording():void{
			nc.call("VCRStop", new Responder(gotStop, gotFault));
		}
		
		public function pauseRecording():void{
			nc.call("pauseRecording", new Responder(gotPause, gotFault));
		}
		
		public function gotStart(reult:Object):void{
			
		}
		
		public function gotStop(result:Object):void{
			Alert.show("got stop" + result);
			var recordingURL:String = result as String;
			sendNotification(RECORDING_URL, recordingURL);
		}
		
		public function gotPause(result:Object):void{
			
		}
		
		public function gotFault(fault:Object):void{
			Alert.show("error");
		}

	}
}