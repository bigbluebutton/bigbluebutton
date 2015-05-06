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
	import flash.events.TimerEvent;
	import flash.media.H264Level;
	import flash.media.H264Profile;
	import flash.media.H264VideoStreamSettings;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.system.Capabilities;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.ClientStatusEvent;
	import org.bigbluebutton.main.model.users.AutoReconnect;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
	import org.bigbluebutton.modules.videoconf.events.ConnectedEvent;
	import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

	
	public class VideoProxy
	{		
		public static const LOG:String = "VideoProxy - ";

		public var videoOptions:VideoConfOptions;
		
		private var nc:NetConnection;
		private var _url:String;
		private var camerasPublishing:Object = new Object();
		private var logoutOnUserCommand:Boolean = false;
		private var reconnect:AutoReconnect = new AutoReconnect();
		private var reconnecting:Boolean = false;
		private var dispatcher:Dispatcher = new Dispatcher();
    
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
			
		}
		
    public function connect():void {
      nc.connect(_url, UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID());
    }
    
		private function onAsyncError(event:AsyncErrorEvent):void{
		}
		
		private function onIOError(event:NetStatusEvent):void{
		}
		
    private function onConnectedToVideoApp():void{
      dispatcher.dispatchEvent(new ConnectedEvent(ConnectedEvent.VIDEO_CONNECTED));
    }
    
		private function onNetStatus(event:NetStatusEvent):void{
			trace(LOG + "[" + event.info.code + "] for [" + _url + "]");
			switch(event.info.code){
				case "NetConnection.Connect.Success":
					if (reconnecting) {
						dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.SUCCESS_MESSAGE_EVENT, 
							"Connection reestablished", 
							"Video connection has been reestablished successfully"));
							reconnecting = false;
					}
          onConnectedToVideoApp();
					break;
					
				case "NetConnection.Connect.Closed":
					if (!logoutOnUserCommand) {
						dispatcher.dispatchEvent(new StopBroadcastEvent());

						dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.WARNING_MESSAGE_EVENT, 
							"Video connection dropped", 
							"Attempting to reconnect"));
						reconnecting = true;
						reconnect.onDisconnect(connect);
					}
					break;
					
				case "NetConnection.Connect.Failed":
					if (reconnecting) {
						reconnect.onConnectionAttemptFailed();
					}
					break;
			}
		}
		
		private function onSecurityError(event:NetStatusEvent):void{
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
//		Uncomment if you want to build support for H264. But you need at least FP 11. (ralam july 23, 2011)	
//			if (Capabilities.version.search("11,0") != -1) {
			if ((BBB.getFlashPlayerVersion() >= 11) && e.videoProfile.enableH264) {
//			if (BBB.getFlashPlayerVersion() >= 11) {
				LogUtil.info("Using H264 codec for video.");
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
				
				LogUtil.info("Codec used: " + h264Level);
				
				h264.setProfileLevel(h264profile, h264Level);
				ns.videoStreamSettings = h264;
			}
			
			ns.publish(e.stream);
			camerasPublishing[e.stream] = ns;
		}
		
		public function stopBroadcasting(stream:String):void{
      trace("Closing netstream for webcam publishing");
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
			logoutOnUserCommand = true;
      trace("VideoProxy:: disconnecting from Video application");
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
			trace("bandwidth = " + p_bw + " Kbps."); 
		}
		

	}
}
