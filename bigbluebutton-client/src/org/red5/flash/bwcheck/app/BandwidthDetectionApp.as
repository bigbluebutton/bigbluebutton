package org.red5.flash.bwcheck.app
{
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	
	import mx.core.Application;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.model.BandwidthMonOptions;
	import org.bigbluebutton.util.ConnUtil;
	import org.red5.flash.bwcheck.ClientServerBandwidth;
	import org.red5.flash.bwcheck.ServerClientBandwidth;
	import org.red5.flash.bwcheck.events.BandwidthDetectEvent;
	
	public class BandwidthDetectionApp extends Application
	{
		private var _serverURL:String = "localhost";
		private var _serverApplication:String = "";
		private var _clientServerService:String = "";
		private var _serverClientService:String = "";
		private var bwMonOption: BandwidthMonOptions; 
		private var nc:NetConnection;
		
		public function BandwidthDetectionApp()
		{
			
		}
		
		public function set serverURL(url:String):void
		{
			_serverURL = url;
		}
		
		public function set serverApplication(app:String):void
		{
			_serverApplication = app;
		}
		
		public function set clientServerService(service:String):void
		{
			_clientServerService = service;
		}
		
		public function set serverClientService(service:String):void
		{
			_serverClientService = service;
		}
		
		public function connect():void
		{
			bwMonOption = Options.getOptions(BandwidthMonOptions) as BandwidthMonOptions;
			
			var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)/;
			var result:Array = pattern.exec(bwMonOption.server);
			
			var bwMonUrl: String;
			
			nc = new NetConnection();
			
			var useRTMPS: Boolean = result.protocol == ConnUtil.RTMPS;
			if (BBB.initConnectionManager().isTunnelling) {
				var tunnelProtocol: String = ConnUtil.RTMPT;
				
				if (useRTMPS) {
					nc.proxyType = ConnUtil.PROXY_NONE;
					tunnelProtocol = ConnUtil.RTMPS;
				}
				
				bwMonUrl = tunnelProtocol + "://" + result.server + "/" + bwMonOption.application;
				trace("******* BW MON CONNECT tunnel = TRUE " + "url=" +  bwMonUrl);
			} else {
				var nativeProtocol: String = ConnUtil.RTMP;
				if (useRTMPS) {
					nc.proxyType = ConnUtil.PROXY_BEST;
					nativeProtocol = ConnUtil.RTMPS;
				}
				
				bwMonUrl = nativeProtocol + "://" + result.server + "/" + bwMonOption.application;
				trace("******* BBB MON CONNECT tunnel = FALSE " + "url=" +  bwMonUrl);
			}

			nc.objectEncoding = flash.net.ObjectEncoding.AMF3;
			nc.client = this;
			nc.addEventListener(NetStatusEvent.NET_STATUS, onStatus);	
			nc.connect(bwMonUrl);
		}
		
		
		private function onStatus(event:NetStatusEvent):void
		{
			switch (event.info.code)
			{
				case "NetConnection.Connect.Success":
					LogUtil.debug(event.info.code);
					LogUtil.debug("Detecting Server Client Bandwidth");
					ServerClient();
				break;	
			}
			
		}
		
		public function ClientServer():void
		{
			var clientServer:ClientServerBandwidth  = new ClientServerBandwidth();
			//connect();
			clientServer.connection = nc;
			clientServer.service = _clientServerService;
			clientServer.addEventListener(BandwidthDetectEvent.DETECT_COMPLETE,onClientServerComplete);
			clientServer.addEventListener(BandwidthDetectEvent.DETECT_STATUS,onClientServerStatus);
			clientServer.addEventListener(BandwidthDetectEvent.DETECT_FAILED,onDetectFailed);
			clientServer.start();
		}
		
		public function ServerClient():void
		{
			var serverClient:ServerClientBandwidth = new ServerClientBandwidth();
			//connect();
			serverClient.connection = nc;
			serverClient.service = _serverClientService;
			serverClient.addEventListener(BandwidthDetectEvent.DETECT_COMPLETE,onServerClientComplete);
			serverClient.addEventListener(BandwidthDetectEvent.DETECT_STATUS,onServerClientStatus);
			serverClient.addEventListener(BandwidthDetectEvent.DETECT_FAILED,onDetectFailed);
			
			serverClient.start();
		}
		
		public function onDetectFailed(event:BandwidthDetectEvent):void
		{
			LogUtil.debug("Detection failed with error: " + event.info.application + " " + event.info.description);
		}
		
		public function onClientServerComplete(event:BandwidthDetectEvent):void
		{			
			LogUtil.debug("kbitUp = " + event.info.kbitUp + ", deltaUp= " + event.info.deltaUp + ", deltaTime = " + event.info.deltaTime + ", latency = " + event.info.latency + " KBytes " + event.info.KBytes);
			LogUtil.debug("Client to Server Bandwidth Detection Complete");
		}
		
		public function onClientServerStatus(event:BandwidthDetectEvent):void
		{
			if (event.info) {
				LogUtil.debug("count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" overhead:  "+event.info.overhead+" packet interval: " + event.info.pakInterval + " cumLatency: " + event.info.cumLatency);
			}
		}
		
		public function onServerClientComplete(event:BandwidthDetectEvent):void
		{
			LogUtil.debug("kbit Down: " + event.info.kbitDown + " Delta Down: " + event.info.deltaDown + " Delta Time: " + event.info.deltaTime + " Latency: " + event.info.latency);
			LogUtil.debug("Server Client Bandwidth Detect Complete");
			LogUtil.debug("Detecting Client Server Bandwidth");
			ClientServer();
		}
		
		public function onServerClientStatus(event:BandwidthDetectEvent):void
		{	
			if (event.info) {
				LogUtil.debug("count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" cumLatency: " + event.info.cumLatency);
			}
		}

	}
}
