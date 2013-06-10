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
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
	import org.bigbluebutton.modules.videoconf.events.ConnectedEvent;
	import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

	
	public class VideoProxy
	{		
		public var videoOptions:VideoConfOptions;
		
		private var nc:NetConnection;
		private var ns:NetStream;
		private var _url:String;
    
		private function parseOptions():void {
			videoOptions = new VideoConfOptions();
			videoOptions.parseOptions();	
		}
		
		public function VideoProxy(url:String)
		{
      _url = url;
			parseOptions();			
			nc = new NetConnection();
			nc.client = this;
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			
		}
		
    public function connect():void {
      nc.connect(_url);
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
		
		public function get connection():NetConnection{
			return this.nc;
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
      trace("Closing netstream for webcam publishing");
      
			if (ns != null) {
				ns.attachCamera(null);
				ns.close();
				ns = null;
				ns = new NetStream(nc);
			}			
		}
		
		public function disconnect():void {
      trace("VideoProxy:: disconnecting from Video application");
      stopBroadcasting();
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
