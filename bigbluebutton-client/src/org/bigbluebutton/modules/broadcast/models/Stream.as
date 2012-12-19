package org.bigbluebutton.modules.broadcast.models
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;	
	import mx.core.UIComponent;	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.broadcast.views.BroadcastWindow;

	public class Stream {
		private var uri:String;
		private var streamId:String;
		private var streamName:String;
		private var window:BroadcastWindow;
		private var ns:NetStream;
		private var nc:NetConnection;
		private var video:Video;
		private var videoWidth:int;
		private var videoHeight:int;
		
		[Bindable]
		public var width:int = 320;
		[Bindable]
		public var height:int = 240;
		
		public function Stream(uri:String, streamId:String, streamName:String) {
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
			ns.play(streamId);				
		}		
				
		private function netstreamStatus(evt:NetStatusEvent):void {
			switch(evt.info.code) {			
				case "NetStream.Play.StreamNotFound":
					LogUtil.debug("NetStream.Play.StreamNotFound");
					break;			
				case "NetStream.Play.Failed":
					LogUtil.debug("NetStream.Play.Failed");
					break;
				case "NetStream.Play.Start":	
					LogUtil.debug("NetStream.Play.Start");
					break;
				case "NetStream.Play.Stop":			
					LogUtil.debug("NetStream.Play.Stop");
					break;
				case "NetStream.Buffer.Full":
					LogUtil.debug("NetStream.Buffer.Full");
					break;
				default:
			}			 
		} 
		
		private function nsAsyncErrorHandler(event:AsyncErrorEvent):void {
			LogUtil.debug("nsAsyncErrorHandler: " + event);
		}
		
		private function connect():void {
			LogUtil.debug("Connecting " + uri);
			nc = new NetConnection();
			nc.connect(uri);
			nc.client = this;
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
		}
		
		private function netStatus(evt:NetStatusEvent ):void {		 			
			switch(evt.info.code) {				
				case "NetConnection.Connect.Success":
					LogUtil.debug("Successfully connected to SIP application.");
					displayVideo();
					break;				
				case "NetConnection.Connect.Failed":
					LogUtil.debug("Failed to connect to SIP application.");
					break;				
				case "NetConnection.Connect.Closed":
					trace("Connection to SIP application has closed.");
					break;				
				case "NetConnection.Connect.Rejected":
					LogUtil.debug("Connection to SIP application was rejected.");
					break;					
				default:	
					LogUtil.debug("Connection to SIP application failed. " + evt.info.code);
			}			
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
			LogUtil.debug("securityErrorHandler: " + event);
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
		
		public function stop():void {
			ns.close();
			nc.close();
		}
		
		public function onCuePoint(infoObject:Object):void {
			LogUtil.debug("onCuePoint");
		}
		
		public function onMetaData(info:Object):void {
			LogUtil.debug("****metadata: width=" + info.width + " height=" + info.height);
			videoWidth = info.width;
			videoHeight = info.height;
			video.width = info.width;
			video.height = info.height;
			window.onResize();
		}
		
		public function onPlayStatus(infoObject:Object):void {
			LogUtil.debug("onPlayStatus");
		}		
		
		public function resizeVideo(w:Number, h:Number):void {
			video.width = w;
			video.height = h;
		}
		
		public function onResize():void {
			fitVideoToWindow();
			LogUtil.debug("Video [" + video.width + "," + video.height + "]");
			window.videoHolder2.addChild(video);
		}
				
		private function fitVideoToWindow():void {
			video.width = window.videoHolder2.width;
			video.height = window.videoHolder2.height;
		}
		
		public function getAstpectRatio():Number {
			return videoWidth / videoHeight;
		}

	}
}