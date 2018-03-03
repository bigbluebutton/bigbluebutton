package org.bigbluebutton.air.common.views {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import mx.core.UIComponent;
	
	import spark.components.Group;
	
	public class VideoView extends UIComponent {
		protected var ns:NetStream;
		
		protected var video:Video;
		
		protected var aspectRatio:Number = 0;
		
		protected var connection:NetConnection;
		
		public var userID:String;
		
		public var userName:String;
		
		public var streamName:String;
		
		public function VideoView():void {
			video = new Video();
		}
		
		public function startStream(connection:NetConnection, name:String, streamName:String, userID:String):void {
			this.userName = name;
			this.userID = userID;
			this.streamName = streamName;
			this.connection = connection;
			ns = new NetStream(connection);
			ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			ns.client = this;
			ns.bufferTime = 0;
			ns.receiveVideo(true);
			ns.receiveAudio(false);
			video.smoothing = true;
			video.attachNetStream(ns);
			ns.play(streamName);
		}
		
		public function get videoViewVideo():Video {
			return video;
		}
		
		private function onNetStatus(e:NetStatusEvent):void {
			switch (e.info.code) {
				case "NetStream.Publish.Start":
					trace("NetStream.Publish.Start for broadcast stream " + streamName);
					break;
				case "NetStream.Play.UnpublishNotify":
					this.close();
					break;
				case "NetStream.Play.Start":
					trace("Netstatus: " + e.info.code);
					break;
				case "NetStream.Play.FileStructureInvalid":
					trace("The MP4's file structure is invalid.");
					break;
				case "NetStream.Play.NoSupportedTrackFound":
					trace("The MP4 doesn't contain any supported tracks");
					break;
			}
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void {
			trace("VideoWindow::asyncerror " + e.toString());
		}
		
		public function close():void {
			if (video && video.parent) {
				video = null;
			}
			if (ns) {
				ns.removeEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
				ns.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
				ns.close();
				ns = null;
			}
		}
	}
}
