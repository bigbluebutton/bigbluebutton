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
package org.bigbluebutton.modules.broadcast.models
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.net.ObjectEncoding;
	
	import mx.core.UIComponent;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.broadcast.views.BroadcastWindow;

	public class Stream {
		private static const LOGGER:ILogger = getClassLogger(Stream);

		private var uri:String;
		private var streamId:String;
		private var streamName:String;
		private var window:BroadcastWindow;
		private var ns:NetStream;
		private var nc:NetConnection;
		private var video:Video;
		private var videoWidth:int;
		private var videoHeight:int;
		private var videoHolder:UIComponent;
    
		[Bindable]
		public var width:int = 320;
		[Bindable]
		public var height:int = 240;
		
		public function Stream(uri:String, streamId:String, streamName:String) {
      videoHolder = new UIComponent();
			this.uri = uri;
			this.streamId = streamId;
			this.streamName = streamName;
		}

		public function play(w:BroadcastWindow):void {
			window = w;
			connect();
		}
		
		public function getStreamId():String {
			return streamId;
		}
		
		private function displayVideo():void {
			video = new Video();
			ns = new NetStream(nc);
			ns.client = this;
			ns.bufferTime = 0;
			ns.receiveVideo(true);
			ns.receiveAudio(true);
			ns.addEventListener(NetStatusEvent.NET_STATUS, netstreamStatus);
			ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, nsAsyncErrorHandler);
			video.attachNetStream(ns);
			video.x = videoHolder.x;
			video.y = videoHolder.y;
			video.width = videoHolder.width;
			video.height = videoHolder.height;

			ns.play(streamId);
		}

		private function netstreamStatus(evt:NetStatusEvent):void {
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["video"];
			logData.streamStatus = evt.info.code;
			logData.logCode = "netstream_status";
			var stringLog:String = JSON.stringify(logData);

			switch(evt.info.code) {
				case "NetStream.Play.StreamNotFound":
					LOGGER.warn(stringLog);
					break;
				case "NetStream.Play.Failed":
					LOGGER.error(stringLog);
					break;
				case "NetStream.Play.Start":
					LOGGER.debug(stringLog);
					break;
				case "NetStream.Play.Stop":
					LOGGER.debug(stringLog);
					break;
				case "NetStream.Buffer.Full":
					LOGGER.warn(stringLog);
					break;
				default:
			}
		} 

		private function nsAsyncErrorHandler(event:AsyncErrorEvent):void {
			LOGGER.debug("nsAsyncErrorHandler: {0}", [event]);
		}
		
		private function connect():void {
			nc = new NetConnection();
			nc.objectEncoding = ObjectEncoding.AMF3;
			nc.proxyType = "best";
			nc.connect(uri);
			nc.client = this;
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
		}

		private function netStatus(evt:NetStatusEvent ):void {
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["broadcast"];
			logData.streamStatus = evt.info.code;
			logData.streamId = streamName;
			
			switch(evt.info.code) {
				case "NetConnection.Connect.Success":
					logData.logCode = "conn_connected";
					LOGGER.debug(JSON.stringify(logData));
					displayVideo();
					break;
				case "NetConnection.Connect.Failed":
					logData.logCode = "conn_failed";
					LOGGER.error(JSON.stringify(logData));
					break;
				case "NetConnection.Connect.Closed":
					logData.logCode = "conn_closed";
					LOGGER.error(JSON.stringify(logData));
					break;
				case "NetConnection.Connect.Rejected":
					logData.logCode = "conn_rejected";
					LOGGER.warn(JSON.stringify(logData));
					break;
				default:
					logData.logCode = "conn_failed_unknown_reason";
					LOGGER.error(JSON.stringify(logData));
			}
		}

		private function securityErrorHandler(event:SecurityErrorEvent):void {
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["video"];
			logData.logCode = "conn_security_error";
			var stringLog:String = JSON.stringify(logData);
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
		
		public function stop():void {
      window.videoHolderBox.removeChild(videoHolder);
      videoHolder.removeChild(video);
      ns.close();
      nc.close();      
      video = null;
		}
		
		public function onCuePoint(infoObject:Object):void {
			LOGGER.debug("onCuePoint");
		}
		
		public function onMetaData(info:Object):void {
			LOGGER.debug("****metadata: width={0} height={1}" + [info.width, info.height]);
			videoWidth = info.width;
			videoHeight = info.height;
      
      determineHowToDisplayVideo();
		}
		
    public function onResize():void {
      if (video != null) {
        determineHowToDisplayVideo();        
      }
    }
    
		public function onPlayStatus(infoObject:Object):void {
			LOGGER.debug("onPlayStatus");
		}		
		
    private function centerToWindow():void{
      videoHolder.width = video.width = videoWidth;
      videoHolder.height = video.height = videoHeight;
      videoHolder.x = video.x = (window.width - video.width) / 2;
      videoHolder.y = video.y = (window.height - video.height) / 2;
      
      videoHolder.addChild(video);
      window.videoHolderBox.addChild(videoHolder);
    }
    
    private function fitVideoToWindow():void {
      if (window.width < window.height) {
        fitToWidthAndAdjustHeightToMaintainAspectRatio();				
      } else {
        fitToHeightAndAdjustWidthToMaintainAspectRatio();
      }				
    }
       
    private function videoIsSmallerThanWindow():Boolean {
      return (videoHeight < window.height) && (videoWidth < window.width);
    }
    
    private const VIDEO_WIDTH_PADDING:int = 7;
    private const VIDEO_HEIGHT_PADDING:int = 65;
    
    private function fitToWidthAndAdjustHeightToMaintainAspectRatio():void {
      videoHolder.width = video.width = window.width - VIDEO_WIDTH_PADDING;
      // Maintain aspect-ratio
      videoHolder.height = video.height = (videoHeight * video.width) / videoWidth;
      videoHolder.x = video.x = 0;
      videoHolder.y = video.y = 0;
      
      videoHolder.addChild(video);
      window.videoHolderBox.addChild(videoHolder);
    }
    
    private function fitToHeightAndAdjustWidthToMaintainAspectRatio():void {
      videoHolder.height = video.height = window.height - VIDEO_HEIGHT_PADDING;
      // Maintain aspect-ratio
      videoHolder.width = video.width = (videoWidth * video.height) / videoHeight;
      
      if (videoHolder.width > window.width - VIDEO_WIDTH_PADDING) {
        videoHolder.width = video.width = window.width - VIDEO_WIDTH_PADDING;
        videoHolder.height = video.height = (videoHeight * video.width) / videoWidth;
      }
      
      videoHolder.x = video.x = (window.width - VIDEO_WIDTH_PADDING - video.width) / 2;
      videoHolder.y = video.y = (window.height - VIDEO_WIDTH_PADDING - video.height) / 2;	
      
      videoHolder.addChild(video);
      window.videoHolderBox.addChild(videoHolder);
    }
       
    private function determineHowToDisplayVideo():void {
//      if (videoIsSmallerThanWindow()) {
//        centerToWindow();
//      } else {
        fitVideoToWindow();
//      }
    }
    
	}
}
