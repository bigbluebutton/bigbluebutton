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
package org.bigbluebutton.modules.videoconf.business
{
	import com.asfusion.mate.events.Dispatcher;	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.H264Level;
	import flash.media.H264Profile;
	import flash.media.H264VideoStreamSettings;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.system.Capabilities;
	import flash.utils.Dictionary;

	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.modules.videoconf.events.ConnectedEvent;
	import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
	import org.bigbluebutton.modules.videoconf.events.PlayConnectionReady;
	import org.bigbluebutton.modules.videoconf.services.messaging.MessageSender;
	import org.bigbluebutton.modules.videoconf.services.messaging.MessageReceiver;

	
	public class VideoProxy
	{		
		public var videoOptions:VideoConfOptions;
		
		// NetConnection used for stream publishing
		private var nc:NetConnection;
		// NetStream used for stream publishing
		private var ns:NetStream;
		private var _url:String;

		// Message sender to request stream path
		private var msgSender:MessageSender;
		// Message receiver to receive the stream path
		private var msgReceiver:MessageReceiver;

		// Dictionary<url,NetConnection> used for stream playing
		private var playConnectionDict:Dictionary;
		// Dictionary<url,int> used to keep track of how many streams use a URL
		private var playConnectionCountDict:Dictionary;
		// Dictionary<streamName,streamNamePrefix> used for stream playing
		private var streamNamePrefixDict:Dictionary;
		// Dictionary<streamName,url>
		private var streamUrlDict:Dictionary;

		private function parseOptions():void {
			videoOptions = new VideoConfOptions();
			videoOptions.parseOptions();	
		}
		
		public function VideoProxy(url:String)
		{
      _url = url;
			parseOptions();			
			nc = new NetConnection();
			nc.proxyType = "best";
			nc.client = this;
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			playConnectionDict = new Dictionary();
			playConnectionCountDict = new Dictionary();
			streamNamePrefixDict = new Dictionary();
			streamUrlDict = new Dictionary();
			msgReceiver = new MessageReceiver(this);
			msgSender = new MessageSender();
		}
		
    public function connect():void {
    	nc.connect(_url);
		playConnectionDict[_url] = nc;
		playConnectionCountDict[_url] = 0;
    }
    
		private function onAsyncError(event:AsyncErrorEvent):void{
		}
		
		private function onIOError(event:NetStatusEvent):void{
		}
		
    private function onConnectedToVideoApp():void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new ConnectedEvent(ConnectedEvent.VIDEO_CONNECTED));
    }

		private function onNetStatus(event:NetStatusEvent):void{
			switch(event.info.code){
				case "NetConnection.Connect.Success":
					ns = new NetStream(nc);
          onConnectedToVideoApp();
					break;
        default:
					LogUtil.debug("[" + event.info.code + "] for [" + _url + "]");
					break;
			}
		}

		private function onSecurityError(event:NetStatusEvent):void{
		}
		
		public function get publishConnection():NetConnection{
			return this.nc;
		}

		private function onPlayNetStatus(event:NetStatusEvent):void {
			switch(event.info.code){
				case "NetConnection.Connect.Success":
					var dispatcher:Dispatcher = new Dispatcher();
					dispatcher.dispatchEvent(new PlayConnectionReady(PlayConnectionReady.PLAY_CONNECTION_READY));
					break;
				default:
					LogUtil.debug("[" + event.info.code + "] for a play connection");
					break;
			}
		}

		public function createPlayConnectionFor(streamName:String):void {
			LogUtil.debug("VideoProxy::createPlayConnectionFor:: Requesting path for stream [" + streamName + "]");

			// Ask red5 the path to stream
			msgSender.getStreamPath(streamName);
		}

		public function handleStreamPathReceived(streamName:String, connectionPath:String):void {
			LogUtil.debug("VideoProxy::handleStreamPathReceived:: Path for stream [" + streamName + "]: [" + connectionPath + "]");

			var newUrl:String;
			var streamPrefix:String;

			// Check whether the is through proxy servers or not
			if(connectionPath == "") {
				newUrl = _url;
				streamPrefix = "";
			}
			else {
				var ipRegex:RegExp = /([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/;
				var serverIp:String = connectionPath.split("/")[0];
				newUrl = _url.replace(ipRegex, serverIp);
				streamPrefix = connectionPath.replace(serverIp + "/", "") + "/";
			}

			// Store URL for this stream
			streamUrlDict[streamName] = newUrl;

			// Set current streamPrefix to use the current path
			streamNamePrefixDict[streamName] = streamPrefix;

			// If connection with this URL does not exist
			if(!playConnectionDict[newUrl]){
				// Create new NetConnection and store it
				var connection:NetConnection = new NetConnection();
				connection.client = this;
				connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
				connection.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
				connection.addEventListener(NetStatusEvent.NET_STATUS, onPlayNetStatus);
				connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
				connection.connect(newUrl);
				// TODO change to trace
				LogUtil.debug("VideoProxy::handleStreamPathReceived:: Creating NetConnection for [" + newUrl + "]");
				playConnectionDict[newUrl] = connection;
				playConnectionCountDict[newUrl] = 0;
			}
			else {
				if(playConnectionDict[newUrl].connected) {
					// Connection is ready, send event
					var dispatcher:Dispatcher = new Dispatcher();
					dispatcher.dispatchEvent(new PlayConnectionReady(PlayConnectionReady.PLAY_CONNECTION_READY));
				}
				// TODO change to trace
				LogUtil.debug("VideoProxy::handleStreamPathReceived:: Found NetConnection for [" + newUrl + "]");
			}
		}

		public function playConnectionIsReadyFor(streamName:String):Boolean {
			var streamUrl:String = streamUrlDict[streamName];
			if(playConnectionDict[streamUrl].connected)
				return true;
			return false;
		}

		public function getPlayConnectionFor(streamName:String):NetConnection {
			var streamUrl:String = streamUrlDict[streamName];
			playConnectionCountDict[streamUrl] = playConnectionCountDict[streamUrl] + 1;
			// TODO: change to trace
			LogUtil.debug("VideoProxy:: getPlayConnection:: URL: [" + streamUrl + "], count: [" + playConnectionCountDict[streamUrl] + "]");
			return playConnectionDict[streamUrl];
		}

		public function getStreamNamePrefixFor(streamName:String):String{
			// If does not exist
			if(streamNamePrefixDict[streamName] == null){
				// TODO: change LogUtil.debug(); to trace();
				LogUtil.debug("VideoProxy:: getStreamNamePrefixFor:: streamPrefix not found. NetConnection might not exist for stream [" + streamName + "]");
				return "";
			}
			else{
				return streamNamePrefixDict[streamName];
			}
		}

		public function closePlayConnectionFor(streamName:String):void {
			var streamUrl:String = streamUrlDict[streamName];
			// Do not close publish connection, no matter what
			if(playConnectionDict[streamUrl] == nc)
				return;
			if(streamUrl != null) {
				var count:int = playConnectionCountDict[streamUrl] - 1;
				// TODO: change to trace
				LogUtil.debug("VideoProxy:: closePlayConnectionFor:: stream: [" + streamName + "], URL: [" + streamUrl + "], new streamCount: [" + count + "]");
				playConnectionCountDict[streamUrl] = count;
				if(count <= 0) {
					// No one else is using this NetConnection
					var connection:NetConnection = playConnectionDict[streamUrl];
					if(connection != null) connection.close();
					delete playConnectionDict[streamUrl];
					delete playConnectionCountDict[streamUrl];
				}
			}
		}

		public function startPublishing(e:StartBroadcastEvent):void{
			ns.addEventListener( NetStatusEvent.NET_STATUS, onNetStatus );
			ns.addEventListener( IOErrorEvent.IO_ERROR, onIOError );
			ns.addEventListener( AsyncErrorEvent.ASYNC_ERROR, onAsyncError );
			ns.client = this;
			ns.attachCamera(e.camera);
//		Uncomment if you want to build support for H264. But you need at least FP 11. (ralam july 23, 2011)	
//			if (Capabilities.version.search("11,0") != -1) {
			if ((BBB.getFlashPlayerVersion() >= 11) && videoOptions.enableH264) {
//			if (BBB.getFlashPlayerVersion() >= 11) {
				LogUtil.info("Using H264 codec for video.");
				var h264:H264VideoStreamSettings = new H264VideoStreamSettings();
				var h264profile:String = H264Profile.MAIN;
				if (videoOptions.h264Profile != "main") {
					h264profile = H264Profile.BASELINE;
				}
				var h264Level:String = H264Level.LEVEL_4_1;
				if (videoOptions.h264Level == "1") {
					h264Level = H264Level.LEVEL_1;
				} else if (videoOptions.h264Level == "1.1") {
					h264Level = H264Level.LEVEL_1_1;
				} else if (videoOptions.h264Level == "1.2") {
					h264Level = H264Level.LEVEL_1_2;
				} else if (videoOptions.h264Level == "1.3") {
					h264Level = H264Level.LEVEL_1_3;
				} else if (videoOptions.h264Level == "1b") {
					h264Level = H264Level.LEVEL_1B;
				} else if (videoOptions.h264Level == "2") {
					h264Level = H264Level.LEVEL_2;
				} else if (videoOptions.h264Level == "2.1") {
					h264Level = H264Level.LEVEL_2_1;
				} else if (videoOptions.h264Level == "2.2") {
					h264Level = H264Level.LEVEL_2_2;
				} else if (videoOptions.h264Level == "3") {
					h264Level = H264Level.LEVEL_3;
				} else if (videoOptions.h264Level == "3.1") {
					h264Level = H264Level.LEVEL_3_1;
				} else if (videoOptions.h264Level == "3.2") {
					h264Level = H264Level.LEVEL_3_2;
				} else if (videoOptions.h264Level == "4") {
					h264Level = H264Level.LEVEL_4;
				} else if (videoOptions.h264Level == "4.1") {
					h264Level = H264Level.LEVEL_4_1;
				} else if (videoOptions.h264Level == "4.2") {
					h264Level = H264Level.LEVEL_4_2;
				} else if (videoOptions.h264Level == "5") {
					h264Level = H264Level.LEVEL_5;
				} else if (videoOptions.h264Level == "5.1") {
					h264Level = H264Level.LEVEL_5_1;
				}
				
				LogUtil.info("Codec used: " + h264Level);
				
				h264.setProfileLevel(h264profile, h264Level);
				ns.videoStreamSettings = h264;
			}
			
			ns.publish(e.stream);
		}
		
		public function stopBroadcasting():void{
      LogUtil.debug("Closing netstream for webcam publishing");
      
			if (ns != null) {
				ns.attachCamera(null);
				ns.close();
				ns = null;
				ns = new NetStream(nc);
			}			
		}
		
		public function disconnect():void {
      LogUtil.debug("VideoProxy:: disconnecting from Video application");
      stopBroadcasting();
			// Close publish NetConnection
			if (nc != null) nc.close();
			// Close play NetConnections
			for (var k:Object in playConnectionDict) {
				var connection:NetConnection = playConnectionDict[k];
				connection.close();
			}
			// Reset dictionaries
			playConnectionDict = new Dictionary();
			playConnectionCountDict = new Dictionary();
			streamNamePrefixDict = new Dictionary();
			streamUrlDict = new Dictionary();
		}
		
		public function onBWCheck(... rest):Number { 
			return 0; 
		} 
		
		public function onBWDone(... rest):void { 
			var p_bw:Number; 
			if (rest.length > 0) p_bw = rest[0]; 
			// your application should do something here 
			// when the bandwidth check is complete 
			LogUtil.debug("bandwidth = " + p_bw + " Kbps."); 
		}
		

	}
}
