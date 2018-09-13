package org.bigbluebutton.air.common.views {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.system.Capabilities;
	
	public class VideoView extends VideoBaseView {
		protected var ns:NetStream;
		
		protected var connection:NetConnection;
		
		public var userId:String;
		
		public var userName:String;
		
		public var streamName:String;
		
		private function get video():Video {
			return videoComp as Video;
		}
		
		public function VideoView():void {
			videoComp = new Video();
			addChild(videoComp);
		}
		
		public function startStream(connection:NetConnection, name:String, streamName:String, userId:String, oWidth:Number, oHeight:Number):void {
			if (ns) {
				close();
			}
			if (connection.uri.indexOf("/video/") != -1 && Capabilities.version.indexOf("IOS") >= 0) {
				streamName = "h263/" + streamName;
			}
			
			this.userName = name;
			this.userId = userId;
			this.streamName = streamName;
			this.connection = connection;
			this.originalVideoWidth = oWidth;
			this.originalVideoHeight = oHeight;
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
		
		private function onNetStatus(e:NetStatusEvent):void {
			switch (e.info.code) {
				case "NetStream.Publish.Start":
					trace("NetStream.Publish.Start for broadcast stream " + streamName);
					break;
				case "NetStream.Play.UnpublishNotify":
					close();
					break;
				case "NetStream.Play.Start":
					trace("Netstatus: " + e.info.code);
					invalidateDisplayList();
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
		
		public function onMetaData(info:Object):void {
			trace("width={0} height={1}", [info.width, info.height]);
		}
		
		public function close():void {
			if (ns) {
				video.attachCamera(null);
				ns.removeEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
				ns.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
				ns.close();
				ns = null;
			}
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			if (ns) {
				resizeForPortrait();
			}
		}
		
		public function rotateVideo(rotation:Number):void {
			if (video && stage.contains(video)) {
				stage.removeChild(video);
			}
			videoComp = new Video();
			video.attachNetStream(ns);
			switch (rotation) {
				case 0:
					resizeForPortrait();
					video.x = width / 2 - video.width / 2;
					video.y = height / 2 - video.height / 2; // + topMenuBarHeight;
					break;
				case -90:
					resizeForLandscape();
					video.x = (width / 2) - (video.height / 2);
					video.y = (height / 2) + (video.width / 2); // + topMenuBarHeight;
					break;
				case 90:
					resizeForLandscape();
					video.x = (width / 2) + (video.height / 2);
					video.y = (height / 2) - (video.width / 2); // + topMenuBarHeight;
					break;
				case 180:
					resizeForPortrait();
					video.x = width / 2 + video.width / 2;
					video.y = (height / 2) + (video.height / 2); // + topMenuBarHeight
					break;
				default:
					break;
			}
			video.rotation = rotation;
			this.stage.addChild(video);
		}
	}
}
