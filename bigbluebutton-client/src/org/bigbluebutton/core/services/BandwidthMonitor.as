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
  import flash.events.IOErrorEvent;
  import flash.events.NetStatusEvent;
  import flash.net.NetConnection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.model.BandwidthMonOptions;
  import org.bigbluebutton.main.model.NetworkStatsData;
  import org.bigbluebutton.util.ConnUtil;
  import org.red5.flash.bwcheck.ClientServerBandwidth;
  import org.red5.flash.bwcheck.ServerClientBandwidth;
  import org.red5.flash.bwcheck.events.BandwidthDetectEvent;

  public class BandwidthMonitor {
    private static const LOGGER:ILogger = getClassLogger(BandwidthMonitor);
    public static const INTERVAL_BETWEEN_CHECKS:int = 30000; // in ms

    private static var _instance:BandwidthMonitor = null;
    private var _clientServerService:String = "checkBandwidthUp";
    private var _serverClientService:String = "checkBandwidth";
    private var _pendingClientToServer:Boolean;
    private var _pendingServerToClient:Boolean;
    private var _lastClientToServerCheck:Date;
    private var _lastServerToClientCheck:Date;
    private var _runningMeasurement:Boolean;
    private var _connecting:Boolean;
    private var _nc:NetConnection;
    
    /**
     * This class is a singleton. Please initialize it using the getInstance() method.
     */
    public function BandwidthMonitor(enforcer:SingletonEnforcer) {
        if (enforcer == null) {
            throw new Error("There can only be one instance of this class");
        }
        initialize();
    }
    
    private function initialize():void {
        _pendingClientToServer = false;
        _pendingServerToClient = false;
        _runningMeasurement = false;
        _connecting = false;
        _lastClientToServerCheck = null;
        _lastServerToClientCheck = null;

        _nc = new NetConnection();
        _nc.proxyType = "best";
        _nc.objectEncoding = flash.net.ObjectEncoding.AMF0;
        _nc.client = this;
        _nc.addEventListener(NetStatusEvent.NET_STATUS, onStatus);
        _nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
        _nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
    }
    
    /**
     * Return the single instance of this class
     */
    public static function getInstance():BandwidthMonitor {
        if (_instance == null) {
            _instance = new BandwidthMonitor(new SingletonEnforcer());
        }
        return _instance;
    }
		
    public function start():void {
      connect();
    }
       
    private function connect():void {
        if (!_nc.connected && !_connecting) {
					var bwMonOption:BandwidthMonOptions = Options.getOptions(BandwidthMonOptions) as BandwidthMonOptions;
					
					var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)/;
					var result:Array = pattern.exec(bwMonOption.server);
					
					var bwMonUrl: String;
					var useRTMPS: Boolean = result.protocol == ConnUtil.RTMPS;
					if (BBB.initConnectionManager().isTunnelling) {
						var tunnelProtocol: String = ConnUtil.RTMPT;
						
						if (useRTMPS) {
							_nc.proxyType = ConnUtil.PROXY_NONE;
							tunnelProtocol = ConnUtil.RTMPS;
						}
						
						
						bwMonUrl = tunnelProtocol + "://" + result.server + "/" + bwMonOption.application;
						LOGGER.debug("BW MON CONNECT tunnel = TRUE " + "url=" +  bwMonUrl);
					} else {
						var nativeProtocol: String = ConnUtil.RTMP;
						if (useRTMPS) {
							_nc.proxyType = ConnUtil.PROXY_BEST;
							nativeProtocol = ConnUtil.RTMPS;
						}
						
						bwMonUrl = nativeProtocol + "://" + result.server + "/" + bwMonOption.application;
						LOGGER.debug("BBB MON CONNECT tunnel = FALSE " + "url=" +  bwMonUrl);
					}
					
            _nc.connect(bwMonUrl);
            _connecting = true;
        }
    }

    public function checkClientToServer():void {
        if (_lastClientToServerCheck != null && _lastClientToServerCheck.getTime() + INTERVAL_BETWEEN_CHECKS > new Date().getTime())
            return;

        if (!_nc.connected) {
            _pendingClientToServer = true;
            connect();
        } if (_runningMeasurement) {
            _pendingClientToServer = true;
        } else {
            _pendingClientToServer = false;
            _runningMeasurement = true;
            _lastClientToServerCheck = new Date();

            LOGGER.debug("Start client-server bandwidth detection");
            var clientServer:ClientServerBandwidth  = new ClientServerBandwidth();
            clientServer.connection = _nc;
            clientServer.service = _clientServerService;
            clientServer.addEventListener(BandwidthDetectEvent.DETECT_COMPLETE,onClientServerComplete);
            clientServer.addEventListener(BandwidthDetectEvent.DETECT_STATUS,onClientServerStatus);
            clientServer.addEventListener(BandwidthDetectEvent.DETECT_FAILED,onDetectFailed);
            clientServer.start();
        }
    }

    public function checkServerToClient():void {
        if (_lastServerToClientCheck != null && _lastServerToClientCheck.getTime() + INTERVAL_BETWEEN_CHECKS > new Date().getTime())
            return;

        if (!_nc.connected) {
            _pendingServerToClient = true;
            connect();
        } if (_runningMeasurement) {
            _pendingServerToClient = true;
        } else {
            _pendingServerToClient = false;
            _runningMeasurement = true;
            _lastServerToClientCheck = new Date();

            LOGGER.debug("Start server-client bandwidth detection");
            var serverClient:ServerClientBandwidth = new ServerClientBandwidth();
            serverClient.connection = _nc;
            serverClient.service = _serverClientService;
            serverClient.addEventListener(BandwidthDetectEvent.DETECT_COMPLETE,onServerClientComplete);
            serverClient.addEventListener(BandwidthDetectEvent.DETECT_STATUS,onServerClientStatus);
            serverClient.addEventListener(BandwidthDetectEvent.DETECT_FAILED,onDetectFailed);
            serverClient.start();
        }
    }

    private function checkPendingOperations():void {
      if (_pendingClientToServer) checkClientToServer();
      if (_pendingServerToClient) checkServerToClient();
    }

    private function onAsyncError(event:AsyncErrorEvent):void {
        LOGGER.debug(event.error.toString());
    }

    private function onIOError(event:IOErrorEvent):void {
        LOGGER.debug(event.text);
    }
    
    private function onStatus(event:NetStatusEvent):void
    {
      switch (event.info.code)
      {
        case "NetConnection.Connect.Success":
          LOGGER.debug("Starting to monitor bandwidth between client and server");
          break;
        default:
          LOGGER.debug("Cannot establish the connection to measure bandwidth");
          break;
      }      
      _connecting = false;
      checkPendingOperations();
    }
    
    public function onDetectFailed(event:BandwidthDetectEvent):void {
      LOGGER.debug("Detection failed with error: " + event.info.application + " " + event.info.description);
      _runningMeasurement = false;
    }
    
    public function onClientServerComplete(event:BandwidthDetectEvent):void {
      LOGGER.debug("Client-server bandwidth detection complete");
//      LOGGER.debug(ObjectUtil.toString(event.info));
      NetworkStatsData.getInstance().setUploadMeasuredBW(event.info);
      _runningMeasurement = false;
      checkPendingOperations();
    }
    
    public function onClientServerStatus(event:BandwidthDetectEvent):void {
      if (event.info) {
//        LOGGER.debug("\n count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" overhead:  "+event.info.overhead+" packet interval: " + event.info.pakInterval + " cumLatency: " + event.info.cumLatency);
      }
    }
    
    public function onServerClientComplete(event:BandwidthDetectEvent):void {
      LOGGER.debug("Server-client bandwidth detection complete");
//      LOGGER.debug(ObjectUtil.toString(event.info));
      NetworkStatsData.getInstance().setDownloadMeasuredBW(event.info);
      _runningMeasurement = false;
      checkPendingOperations();
    }
    
    public function onServerClientStatus(event:BandwidthDetectEvent):void {
      if (event.info) {
//        LOGGER.debug("\n count: "+event.info.count+ " sent: "+event.info.sent+" timePassed: "+event.info.timePassed+" latency: "+event.info.latency+" cumLatency: " + event.info.cumLatency);
      }
    }
  }
}

class SingletonEnforcer{}