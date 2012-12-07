package org.bigbluebutton.core.services
{
  import flash.events.NetStatusEvent;
  import flash.events.TimerEvent;
  import flash.net.NetConnection;
  import flash.utils.Timer;
  
  import org.red5.flash.bwcheck.ClientServerBandwidth;
  import org.red5.flash.bwcheck.ServerClientBandwidth;
  import org.red5.flash.bwcheck.events.BandwidthDetectEvent;

  public class BandwidthMonitor {
    private var _serverURL:String = "localhost";
    private var _serverApplication:String = "";
    private var _clientServerService:String = "";
    private var _serverClientService:String = "";
    private var nc:NetConnection;
    
    private var bwTestTimer:Timer = new Timer(1000, 1);
    
    public function BandwidthMonitor() {
      
    }
    
    public function set serverURL(url:String):void {
      _serverURL = url;
    }
    
    public function set serverApplication(app:String):void {
      _serverApplication = app;
    }
    
    public function set clientServerService(service:String):void {
      _clientServerService = "checkBandwidthUp";
      
    }
    
    public function set serverClientService(service:String):void {
      _serverClientService = "checkBandwidth";
    }
    
    public function start():void {
      connect();
    }
       
    private function connect():void {
      nc = new NetConnection();
      nc.objectEncoding = flash.net.ObjectEncoding.AMF0;
      nc.client = this;
      nc.addEventListener(NetStatusEvent.NET_STATUS, onStatus);	
      nc.connect("rtmpt://" + _serverURL + "/" + _serverApplication);
    }
    
    
    private function onStatus(event:NetStatusEvent):void
    {
      switch (event.info.code)
      {
        case "NetConnection.Connect.Success":
          trace("\n" + event.info.code);
//          trace("\n Detecting Server Client Bandwidth \n\n");
          monitor();
          break;	
      }      
    }
    
    private function monitor():void {
      trace("Starting to monitor bandwidth");
      bwTestTimer =  new Timer(30000);
      bwTestTimer.addEventListener(TimerEvent.TIMER, rtmptRetryTimerHandler);
      bwTestTimer.start();
    }
    
    private function rtmptRetryTimerHandler(event:TimerEvent):void {
      trace("Starting to detect bandwidth from server to client.");
      ServerClient();
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
      trace("Monitoring client.");
      serverClient.start();
    }
    
    public function onDetectFailed(event:BandwidthDetectEvent):void
    {
      trace("\n Detection failed with error: " + event.info.application + " " + event.info.description);
    }
    
    public function onClientServerComplete(event:BandwidthDetectEvent):void
    {			
      trace("\n\n kbitUp = " + event.info.kbitUp + ", deltaUp= " + event.info.deltaUp + ", deltaTime = " + event.info.deltaTime + ", latency = " + event.info.latency + " KBytes " + event.info.KBytes);
      trace("\n\n Client to Server Bandwidth Detection Complete");
    }
    
    public function onClientServerStatus(event:BandwidthDetectEvent):void
    {
      if (event.info) {
        trace("\n count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" overhead:  "+event.info.overhead+" packet interval: " + event.info.pakInterval + " cumLatency: " + event.info.cumLatency);
      }
    }
    
    public function onServerClientComplete(event:BandwidthDetectEvent):void
    {
      trace("\n\n kbit Down: " + event.info.kbitDown + " Delta Down: " + event.info.deltaDown + " Delta Time: " + event.info.deltaTime + " Latency: " + event.info.latency);
      trace("\n\n Server Client Bandwidth Detect Complete");
      trace("\n\n Detecting Client Server Bandwidth\n\n");
      ClientServer();
    }
    
    public function onServerClientStatus(event:BandwidthDetectEvent):void
    {	
      if (event.info) {
        trace("\n count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" cumLatency: " + event.info.cumLatency);
      }
    }
  }
}