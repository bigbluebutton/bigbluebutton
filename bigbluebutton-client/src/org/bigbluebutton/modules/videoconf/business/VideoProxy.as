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
	import flash.net.ObjectEncoding;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ReconnectionManager;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.videoconf.events.ConnectedEvent;
	import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
	import org.bigbluebutton.util.ConnUtil;
	
	public class VideoProxy
	{	
		private static const LOGGER:ILogger = getClassLogger(VideoProxy);
		
		public var videoOptions:VideoConfOptions;
		private var nc:NetConnection;
		private var camerasPublishing:Object = new Object();
		private var reconnect:Boolean = false;
		private var reconnecting:Boolean = false;
		private var dispatcher:Dispatcher = new Dispatcher();
		private var videoConnUrl: String;
		private var numNetworkChangeCount:int = 0;
		
		private function parseOptions():void {
			videoOptions = Options.getOptions(VideoConfOptions) as VideoConfOptions;
			videoOptions.parseOptions();	
		}
		
		public function VideoProxy()
		{
			parseOptions();			
			nc = new NetConnection();
			nc.client = this;
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);			
		}
		
		public function reconnectWhenDisconnected(connect:Boolean):void {
			reconnect = connect;
		}
		
		public function connect():void {
				var options: VideoConfOptions = Options.getOptions(VideoConfOptions) as VideoConfOptions;
				var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
				var result:Array = pattern.exec(options.uri);
				
				var useRTMPS: Boolean = result.protocol == ConnUtil.RTMPS;
				
				var hostName:String = BBB.initConnectionManager().hostToUse;
				
				if (BBB.initConnectionManager().isTunnelling) {
					var tunnelProtocol: String = ConnUtil.RTMPT;
				
					if (useRTMPS) {
						nc.proxyType = ConnUtil.PROXY_NONE;
						tunnelProtocol = ConnUtil.RTMPS;
					}
				
					videoConnUrl = tunnelProtocol + "://" + hostName + "/" + result.app;

				} else {
					var nativeProtocol: String = ConnUtil.RTMP;
					if (useRTMPS) {
						nc.proxyType = ConnUtil.PROXY_BEST;
						nativeProtocol = ConnUtil.RTMPS;
					}
				
					videoConnUrl = nativeProtocol + "://" + hostName + "/" + result.app;

				}
				
				var connId:String = ConnUtil.generateConnId();
				BBB.initConnectionManager().videoConnId = connId;
				
				videoConnUrl = videoConnUrl + "/" + UsersUtil.getInternalMeetingID();
				var authToken: String = LiveMeeting.inst().me.authToken;

				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["webcam"];
				logData.app = "video";
				logData.logCode = "connection_connecting";
				logData.url = videoConnUrl;
				LOGGER.info(JSON.stringify(logData));
				
				nc.objectEncoding = flash.net.ObjectEncoding.AMF3;
				nc.connect(videoConnUrl, UsersUtil.getInternalMeetingID(), 
						UsersUtil.getMyUserID(), authToken, BBB.initConnectionManager().videoConnId);
		}
	    
		private function onAsyncError(event:AsyncErrorEvent):void{
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam"];
			logData.app = "video";
			logData.logCode = "connection_async_error";
			logData.url = videoConnUrl;
			LOGGER.error(JSON.stringify(logData));
		}
		
		private function onIOError(event:NetStatusEvent):void{
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam"];
			logData.app = "video";
			logData.logCode = "connection_io_error";
			logData.url = videoConnUrl;
			LOGGER.error(JSON.stringify(logData));
		}
		
		private function onConnectedToVideoApp():void{
			dispatcher.dispatchEvent(new ConnectedEvent(reconnecting));
			if (reconnecting) {
				reconnecting = false;
				
				var logData:Object = UsersUtil.initLogData();
				logData.url = videoConnUrl;
				logData.tags = ["webcam"];
				logData.app = "video";
				logData.reconnecting = reconnecting;
				logData.logCode = "connection_reconnect_attempt_succeeded";
				LOGGER.info(JSON.stringify(logData));
				
				var attemptSucceeded:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT);
				attemptSucceeded.payload.type = ReconnectionManager.VIDEO_CONNECTION;
				dispatcher.dispatchEvent(attemptSucceeded);
			}
		}
    
		private function onNetStatus(event:NetStatusEvent):void{

			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam"];
			logData.app = "video";
			logData.url = videoConnUrl;
			logData.reconnecting = reconnecting;
			logData.reconnect = reconnect;
						
			switch(event.info.code){
				case "NetConnection.Connect.Success":
					numNetworkChangeCount = 0;
					logData.logCode = "connect_attempt_connected";
          onConnectedToVideoApp();
					break;
				case "NetStream.Play.Failed":
						logData.logCode = "netstream_play_failed";
						LOGGER.info(JSON.stringify(logData));
					
					break;
				case "NetStream.Play.Stop":
						logData.logCode = "netstream_play_stop";
						LOGGER.info(JSON.stringify(logData));
					
					break;		
				case "NetConnection.Connect.Closed":
					logData.logCode = "connection_closed";
					LOGGER.info(JSON.stringify(logData));
					
					dispatcher.dispatchEvent(new StopBroadcastEvent());
					
					if (reconnect) {
						reconnecting = true;
						
						logData.logCode = "connection_reconnect_attempt";
						LOGGER.info(JSON.stringify(logData));
						
						var disconnectedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_DISCONNECTED_EVENT);
						disconnectedEvent.payload.type = ReconnectionManager.VIDEO_CONNECTION;
						disconnectedEvent.payload.callback = connect;
						disconnectedEvent.payload.callbackParameters = [];
						dispatcher.dispatchEvent(disconnectedEvent);
					}
					break;
					
				case "NetConnection.Connect.Failed":
					logData.logCode = "connect_attempt_failed";
					LOGGER.info(JSON.stringify(logData));
					
					if (reconnecting) {
						logData.logCode = "connection_reconnect_attempt_failed";
						LOGGER.info(JSON.stringify(logData));
						
						var attemptFailedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT);
						attemptFailedEvent.payload.type = ReconnectionManager.VIDEO_CONNECTION;
						dispatcher.dispatchEvent(attemptFailedEvent);
					}
										
					disconnect();
					break;		
				case "NetConnection.Connect.NetworkChange":
					numNetworkChangeCount++;
					logData.logCode = "connection_network_change";
					logData.numNetworkChangeCount = numNetworkChangeCount;
					LOGGER.info(JSON.stringify(logData));
					break;
        default:
					logData.logCode = "connection_failed_unknown_reason";
					logData.statusCode = event.info.code;
					LOGGER.info(JSON.stringify(logData));
					break;
			}
		}
		
		private function onSecurityError(event:NetStatusEvent):void{
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam", "connection"];
			logData.app = "video";
			logData.url = videoConnUrl;
			logData.logCode = "connection_security_error";
			LOGGER.info(JSON.stringify(logData));
		}
		
		public function get connection():NetConnection{
			return this.nc;
		}
		
		public function startPublishing(e:StartBroadcastEvent):void{
			var ns:NetStream = new NetStream(nc);
			ns.addEventListener( NetStatusEvent.NET_STATUS, onNetStatus );
			ns.addEventListener( IOErrorEvent.IO_ERROR, onIOError );
			ns.addEventListener( AsyncErrorEvent.ASYNC_ERROR, onAsyncError );
			ns.client = this;
			ns.attachCamera(e.camera);

			if ((BBB.getFlashPlayerVersion() >= 11) && e.videoProfile.enableH264) {
				var h264:H264VideoStreamSettings = new H264VideoStreamSettings();
				var h264profile:String = H264Profile.MAIN;
				if (e.videoProfile.h264Profile != "main") {
					h264profile = H264Profile.BASELINE;
				}
				var h264Level:String = H264Level.LEVEL_4_1;
				switch (e.videoProfile.h264Level) {
					case "1": h264Level = H264Level.LEVEL_1; break;
					case "1.1": h264Level = H264Level.LEVEL_1_1; break;
					case "1.2": h264Level = H264Level.LEVEL_1_2; break;
					case "1.3": h264Level = H264Level.LEVEL_1_3; break;
					case "1b": h264Level = H264Level.LEVEL_1B; break;
					case "2": h264Level = H264Level.LEVEL_2; break;
					case "2.1": h264Level = H264Level.LEVEL_2_1; break;
					case "2.2": h264Level = H264Level.LEVEL_2_2; break;
					case "3": h264Level = H264Level.LEVEL_3; break;
					case "3.1": h264Level = H264Level.LEVEL_3_1; break;
					case "3.2": h264Level = H264Level.LEVEL_3_2; break;
					case "4": h264Level = H264Level.LEVEL_4; break;
					case "4.1": h264Level = H264Level.LEVEL_4_1; break;
					case "4.2": h264Level = H264Level.LEVEL_4_2; break;
					case "5": h264Level = H264Level.LEVEL_5; break;
					case "5.1": h264Level = H264Level.LEVEL_5_1; break;
				}
				
				
				h264.setProfileLevel(h264profile, h264Level);
				ns.videoStreamSettings = h264;
			}
			
			ns.publish(e.stream, "live");
			camerasPublishing[e.stream] = ns;
		}
		
		public function stopBroadcasting(stream:String):void{
      			if (camerasPublishing[stream] != null) {
	      			var ns:NetStream = camerasPublishing[stream];
				ns.attachCamera(null);
				ns.close();
				ns = null;
				delete camerasPublishing[stream];
			}	
		}

		public function stopAllBroadcasting():void {
			for each (var ns:NetStream in camerasPublishing)
			{
				ns.attachCamera(null);
				ns.close();
				ns = null;
			}
			camerasPublishing = new Object();
		}

		public function disconnect():void {
      		stopAllBroadcasting();
			if (nc != null) nc.close();
		}
		
		public function onBWCheck(... rest):Number { 
			return 0; 
		} 
		
		public function onBWDone(... rest):void { 
			var p_bw:Number; 
			if (rest.length > 0) p_bw = rest[0]; 
			// your application should do something here 
			// when the bandwidth check is complete 
			LOGGER.debug("bandwidth = {0} Kbps.", [p_bw]); 
		}
		

	}
}
