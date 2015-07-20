/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.core.services
{
  import flash.events.AsyncErrorEvent;
  import flash.events.NetStatusEvent;
  import flash.events.TimerEvent;
  import flash.net.NetConnection;
  import flash.utils.Timer;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.main.model.NetworkStatsData;
  import org.red5.flash.bwcheck.ClientServerBandwidth;
  import org.red5.flash.bwcheck.ServerClientBandwidth;
  import org.red5.flash.bwcheck.events.BandwidthDetectEvent;

  public class BandwidthMonitor {
	private static const LOGGER:ILogger = getClassLogger(BandwidthMonitor);
	
    private var _serverURL:String = "localhost";
    private var _serverApplication:String = "video";
    private var _clientServerService:String = "checkBandwidthUp";
    private var _serverClientService:String = "checkBandwidth";
    private var nc:NetConnection;
    
    private var bwTestTimer:Timer;
    
    public function BandwidthMonitor() {
      
    }
    
    public function set serverURL(url:String):void {
      _serverURL = url;
    }
    
    public function set serverApplication(app:String):void {
      _serverApplication = app;
    }

    public function start():void {
      connect();
    }
       
    private function connect():void {
      nc = new NetConnection();
      nc.objectEncoding = flash.net.ObjectEncoding.AMF0;
      nc.proxyType = "best";
      nc.client = this;
      nc.addEventListener(NetStatusEvent.NET_STATUS, onStatus);	
      nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);	
      nc.connect("rtmp://" + _serverURL + "/" + _serverApplication);
    }
    
    private function onAsyncError(event:AsyncErrorEvent):void
    {
      LOGGER.debug(event.error.toString());
    }
    
    private function onStatus(event:NetStatusEvent):void
    {
      switch (event.info.code)
      {
        case "NetConnection.Connect.Success":
			LOGGER.debug("Starting to monitor bandwidth between client and server");
 //         monitor();
          break;
        default:
		  LOGGER.debug("Cannot establish the connection to measure bandwidth");
          break;
      }      
    }
    
    private function monitor():void {
	  LOGGER.debug("Starting to monitor bandwidth");
      bwTestTimer =  new Timer(30000);
      bwTestTimer.addEventListener(TimerEvent.TIMER, rtmptRetryTimerHandler);
      bwTestTimer.start();
    }
    
    private function rtmptRetryTimerHandler(event:TimerEvent):void {
	  LOGGER.debug("Starting to detect bandwidth from server to client");
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
      serverClient.start();
    }
    
    public function onDetectFailed(event:BandwidthDetectEvent):void
    {
	  LOGGER.debug("Detection failed with error: {0} {1}", [event.info.application, event.info.description]);
    }
    
    public function onClientServerComplete(event:BandwidthDetectEvent):void
    {
//      LogUtil.debug("Client-slient bandwidth detect complete");
      
//      LogUtil.debug(ObjectUtil.toString(event.info));
      NetworkStatsData.getInstance().setUploadMeasuredBW(event.info);
    }
    
    public function onClientServerStatus(event:BandwidthDetectEvent):void
    {
      if (event.info) {
//        LogUtil.debug("\n count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" overhead:  "+event.info.overhead+" packet interval: " + event.info.pakInterval + " cumLatency: " + event.info.cumLatency);
      }
    }
    
    public function onServerClientComplete(event:BandwidthDetectEvent):void
    {
//      LogUtil.debug("Server-client bandwidth detect complete");
      
//      LogUtil.debug(ObjectUtil.toString(event.info));
      NetworkStatsData.getInstance().setDownloadMeasuredBW(event.info);

//      LogUtil.debug("Detecting Client Server Bandwidth");
      ClientServer();
    }
    
    public function onServerClientStatus(event:BandwidthDetectEvent):void
    {	
      if (event.info) {
//        LogUtil.debug("\n count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" cumLatency: " + event.info.cumLatency);
      }
    }
  }
}
