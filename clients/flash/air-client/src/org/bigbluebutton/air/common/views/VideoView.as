package org.bigbluebutton.air.common.views {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.system.Capabilities;
	import mx.core.UIComponent;
	
	public class VideoView extends UIComponent {
		protected var ns:NetStream;
		
		protected var _video:Video;
		
		protected var connection:NetConnection;
		
		public var userId:String;
		
		public var userName:String;
		
		public var streamName:String;
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		public function VideoView():void {
			_video = new Video();
			addChild(_video);
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
			_video.smoothing = true;
			_video.attachNetStream(ns);
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
				_video.attachCamera(null);
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
		
		public function resizeForPortrait():void {
			// if we have device where screen width less than screen height e.g. phone
			if (width < height) {
				// make the video width full width of the screen 
				_video.width = width;
				// calculate height based on a video width, it order to keep the same aspect ratio
				_video.height = (_video.width / originalVideoWidth) * originalVideoHeight;
				// if calculated height appeared to be bigger than screen height, recalculuate the video size based on width
				if (height < _video.height) {
					// make the video height full height of the screen
					_video.height = height;
					// calculate width based on a video height, it order to keep the same aspect ratio
					_video.width = ((originalVideoWidth * _video.height) / originalVideoHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				_video.height = height;
				// calculate width based on a video height, it order to keep the same aspect ratio
				_video.width = ((originalVideoWidth * _video.height) / originalVideoHeight);
				// if calculated width appeared to be bigger than screen width, recalculuate the video size based on height
				if (width < _video.width) {
					// make the video width full width of the screen 
					_video.width = width;
					// calculate height based on a video width, it order to keep the same aspect ratio
					_video.height = (_video.width / originalVideoWidth) * originalVideoHeight;
				}
			}
			
			_video.x = width - _video.width;
			_video.y = height - _video.height;
		}
		
		public function resizeForLandscape():void {
			if (height < width) {
				_video.height = width;
				_video.width = ((originalVideoWidth * _video.height) / originalVideoHeight);
				if (width < _video.width) {
					_video.width = height;
					_video.height = (_video.width / originalVideoWidth) * originalVideoHeight;
				}
			} else {
				_video.width = height;
				_video.height = (_video.width / originalVideoWidth) * originalVideoHeight;
				if (height < _video.height) {
					_video.height = width;
					_video.width = ((originalVideoWidth * _video.height) / originalVideoHeight);
				}
			}
		}
		
		public function rotateVideo(rotation:Number):void {
			if (_video && stage.contains(_video)) {
				stage.removeChild(_video);
			}
			_video = new Video();
			_video.attachNetStream(ns);
			switch (rotation) {
				case 0:
					resizeForPortrait();
					_video.x = width / 2 - _video.width / 2;
					_video.y = height / 2 - _video.height / 2; // + topMenuBarHeight;
					break;
				case -90:
					resizeForLandscape();
					_video.x = (width / 2) - (_video.height / 2);
					_video.y = (height / 2) + (_video.width / 2); // + topMenuBarHeight;
					break;
				case 90:
					resizeForLandscape();
					_video.x = (width / 2) + (_video.height / 2);
					_video.y = (height / 2) - (_video.width / 2); // + topMenuBarHeight;
					break;
				case 180:
					resizeForPortrait();
					_video.x = width / 2 + _video.width / 2;
					_video.y = (height / 2) + (_video.height / 2); // + topMenuBarHeight
					break;
				default:
					break;
			}
			_video.rotation = rotation;
			this.stage.addChild(_video);
		}
	}
}
