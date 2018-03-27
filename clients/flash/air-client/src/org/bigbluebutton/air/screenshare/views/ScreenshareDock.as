package org.bigbluebutton.air.screenshare.views {
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.StageVideoAvailabilityEvent;
	import flash.events.StageVideoEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.media.StageVideo;
	import flash.media.StageVideoAvailability;
	import flash.media.VideoStatus;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import spark.components.Group;
	
	import org.bigbluebutton.air.main.views.RectCoverView;
	
	public class ScreenshareDock extends Group {
		private var _ns:NetStream;
		
		private var _conn:NetConnection;		
		private var _streamId:String;	
		private var _origVidWidth:int;
		private var _origVidHeight:int;
		private var _sv:StageVideo;
		private var _ssView:ScreenshareView;
		private var _usingStageVideo:Boolean = false;
		private var _usingVideo:Boolean = false;
		private var _played:Boolean = false;
		private var _screenshareRunningListener:Function;
		private var _topRect:RectCoverView;
		private var _bottomRect:RectCoverView;
		
		public function ScreenshareDock():void {	}
		
		private function onStageVideoState(event:StageVideoAvailabilityEvent):void {
			var available:Boolean = (event.availability == StageVideoAvailability.AVAILABLE);
			
			//available = false; // for testing to force using Video instead of StageVideo!!!
			
			trace("************ ScreenshareView: STAGE VIDEO available=" + available);
			stage.removeEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);
			// Detect if StageVideo is available and decide what to do in toggleStageVideo 
			toggleStageVideo(available);
		}
		
		private function toggleStageVideo(available:Boolean):void {
			// To choose StageVideo attach the NetStream to StageVideo 
			if (available) {				
				if (_sv == null) {
					_usingStageVideo = true;
					trace("***** Using StageVideo length=" + stage.stageVideos.length);
					_screenshareRunningListener(_usingStageVideo, true);
					
					setupNetstream();
					
					//trace("**** Container w=" + this.width + ",h=" + this.height + " video w=" + _origVidWidth + ",h=" + _origVidHeight);
					
					var viewPort:Rectangle = positionAndSize(this.width, this.height, _origVidWidth, _origVidHeight);
					_sv = stage.stageVideos[0];
					
					// StageVideo uses global coordinates. We translate this coordinate into local
					// to be relative to this container.
					var point:Point = this.localToGlobal(new Point(viewPort.x, viewPort.y));
					var newViewPort:Rectangle = new Rectangle(point.x, point.y, viewPort.width, viewPort.height);	
					trace("****toggleStageVideo ViewPort x=" + viewPort.x + ",y=" + viewPort.y 
						+ " newViewPort x=" + newViewPort.x + ",y=" + newViewPort.y);
					_sv.viewPort = newViewPort;
					
					// Listen for event if StageVideo can play the stream.
					_sv.addEventListener(StageVideoEvent.RENDER_STATE, stageVideoStateChange);
					_sv.attachNetStream(_ns);
					
					var tRectCoord:Rectangle = calculateTopBlackRect(this.width, this.height, 
						viewPort.x, viewPort.y, newViewPort.width, newViewPort.height);
					_topRect = new RectCoverView();
					positionRect(_topRect, tRectCoord);
					addElement(_topRect);
					
					var bottRectCoord:Rectangle = calculateBottomBlackRect(this.width, this.height, 
						viewPort.x, viewPort.y, newViewPort.width, newViewPort.height);
					_bottomRect = new RectCoverView();
					positionRect(_bottomRect, bottRectCoord);
					addElement(_bottomRect);					
				}
				
				if (_usingVideo) {
					// If you use StageVideo, remove from the display list the 
					// Video object to avoid covering the StageVideo object 
					// (which is always in the background) 
					stage.removeChild(_ssView);
					_usingVideo = false;
				}
			} else {
				useVideoRenderer();
			}
			
			playStream();
		}
		
		public function setupNetstream():void {
			_ns = new NetStream(_conn);
			_ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			_ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			_ns.client = this;
			_ns.bufferTime = 0;
			_ns.receiveVideo(true);
			_ns.receiveAudio(false);
		}
		
		private function playStream():void {
			if (!_played) {
				_played = true;
				trace("***** Playing stream " + _streamId);
				_ns.play(_streamId);
			}
		}
		
		private function useVideoRenderer():void {
			if (_played) {
				_ns.close();
				_played = false;
			}
			
			if (_usingStageVideo) {
				// StageVideo cannot play the stream. Remove listener.
				_usingStageVideo = false;
				if (_topRect != null) {
					removeElement(_topRect);
				}
				if (_bottomRect != null) {
					removeElement(_bottomRect);
				}
				
				_screenshareRunningListener(_usingStageVideo, true);
				
			}
			
			setupNetstream();
			
			trace("***** Using classic Video");
			var viewPort:Rectangle = positionAndSize(this.width, this.height, _origVidWidth, _origVidHeight);
			//trace("**** ViewPort x=" + viewPort.x + ",y=" + viewPort.y);

			_ssView = new ScreenshareView();
			_ssView.x = viewPort.x;
			_ssView.y = viewPort.y;
			_ssView.width = viewPort.width;
			_ssView.height = viewPort.height;
			addElement(_ssView);
			_ssView.display(_ns, viewPort.width, viewPort.height);
			_usingVideo = true;
			
			playStream();
		}
		
		private function stageVideoStateChange(event:StageVideoEvent):void {
			var status:String = event.status;
			trace("***** stageVideoStateChange " + status + ",codec=" + event.codecInfo + ",color=" + event.colorSpace);
			var switchToVideo:Boolean = status == flash.media.VideoStatus.UNAVAILABLE;
			//trace("***** stageVideoStateChange Forcing to use Video " + switchToVideo);
			//switchToVideo = true; // for testing to force using video
			if (switchToVideo) {
				// StageVideo cannot play the stream. Use Video instead.
				useVideoRenderer();
			}
			
		}
			
		public function viewStream(conn:NetConnection, streamId:String, width:int, height:int):void {
			trace("************ ScreenshareView: viewing of screenshare streamId=" + streamId + " w=" + width + " h=" + height);
			_conn = conn;
			_streamId = streamId;
			_origVidWidth = width;
			_origVidHeight = height;
						
			if (stage == null) {
				trace("************ ScreenshareView: STAGE IS NULL!!!!!!!!");
			} else {
				stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);
			}
		}
		
		public function streamStopped(session:String, reason:String):void {
			if (_screenshareRunningListener != null) {
				_screenshareRunningListener(_usingStageVideo, false);
			}
			
			stopViewing();
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			trace("************ ScreenshareView: updateDisplayList !!!!!!!!");
			updateDisplayStream(w, h);
		}
		
		private function updateDisplayStream(w:Number, h:Number):void {
			var viewPort:Rectangle = positionAndSize(w, h, _origVidWidth, _origVidHeight);
			
			if (_usingStageVideo) { 
				// StageVideo uses global coordinates. We translate this coordinate into local
				// to be relative to this container.
				var point:Point = this.localToGlobal(new Point(viewPort.x, viewPort.y));
				var newViewPort:Rectangle = new Rectangle(point.x, point.y, viewPort.width, viewPort.height);	
				trace("**** updateDisplayStream ViewPort x=" + viewPort.x + ",y=" + viewPort.y + " newViewPort x=" 
					+ newViewPort.x + ",y=" + newViewPort.y);
				_sv.viewPort = newViewPort;
				var tRectCoord:Rectangle = calculateTopBlackRect(this.width, this.height, 
					viewPort.x, viewPort.y, newViewPort.width, newViewPort.height);
				
				trace("**** updateDisplayStream TopRect x=" + tRectCoord.x + ",y=" + tRectCoord.y + " w=" 
					+ tRectCoord.width + ",h=" + tRectCoord.height);
				
				positionRect(_topRect, tRectCoord);
				
				var bottRectCoord:Rectangle = calculateBottomBlackRect(this.width, this.height, 
					viewPort.x, viewPort.y, newViewPort.width, newViewPort.height);
				
				trace("**** updateDisplayStream BottomRect x=" + bottRectCoord.x + ",y=" + bottRectCoord.y + " w=" 
					+ bottRectCoord.width + ",h=" + bottRectCoord.height);
				positionRect(_bottomRect, bottRectCoord);
				
			} else if (_usingVideo) {
				trace("***** Using classic Video");
				//trace("**** ViewPort x=" + viewPort.x + ",y=" + viewPort.y);
				_ssView.x = viewPort.x;
				_ssView.y = viewPort.y;
				_ssView.width = viewPort.width;
				_ssView.height = viewPort.height;
				_ssView.updateDisplay(viewPort.width, viewPort.height);
			}
		}
		
		private function onNetStatus(e:NetStatusEvent):void {
			switch (e.info.code) {
				case "NetStream.Publish.Start":
					//					trace("NetStream.Publish.Start for broadcast stream " + streamName);
					break;
				case "NetStream.Play.UnpublishNotify":
					stopViewing();
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
			trace("ScreenshareView::asyncerror " + e.toString());
		}
		
		public function onMetaData(info:Object):void {
			trace("ScreenshareView::ScreenshareView width={0} height={1}", [info.width, info.height]);

		}
		
		public function dispose():void {
			trace("************ ScreenshareView: dispose *********************");
			if (stage != null) {
				trace("************ ScreenshareView::dispose - remove listener ****************");
				stage.removeEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);
			}
			stopViewing();
		}
		
		private function stopViewing():void {
			if (_played) {
				_ns.close();
				if (_usingVideo) {
					removeElement(_ssView);
				}
			}
			_usingStageVideo = _usingVideo = _played = false;
			_origVidWidth = _origVidHeight = 0;
			_ssView = null;
			
			if (_sv != null) {
				// Clean up listener
				_sv.removeEventListener(StageVideoEvent.RENDER_STATE, stageVideoStateChange);
				_sv = null;
			}
		
			_ns = null;
			
		}
		
		public function addScreenshareRunningListener(listener:Function):void {
			_screenshareRunningListener = listener;
		}
	
		private function positionAndSize(contWidth:int, contHeight:int, origVidWidth:int, origVidHeight:int):Rectangle {
			var newVidWidth:int;
			var newVidHeight:int;
			
			// if we have device where screen width less than screen height e.g. phone
			if (contWidth < contHeight) {
				// make the video width full width of the screen 
				newVidWidth = contWidth;
				// calculate height based on a video width, it order to keep the same aspect ratio
				newVidHeight = (newVidWidth / origVidWidth) * origVidHeight;
				// if calculated height appear to be bigger than screen height, recalculate the video size based on width
				if (contHeight < newVidHeight) {
					// make the video height full height of the screen
					newVidHeight = contHeight;
					// calculate width based on a video height, it order to keep the same aspect ratio
					newVidWidth = ((origVidWidth * newVidHeight) / origVidHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				newVidHeight = contHeight;
				// calculate width based on a video height, it order to keep the same aspect ratio
				newVidWidth = ((origVidWidth * newVidHeight) / origVidHeight);
				// if calculated width appear to be bigger than screen width, recalculate the video size based on height
				if (contWidth < newVidWidth) {
					// make the video width full width of the screen 
					newVidWidth = contWidth;
					// calculate height based on a video width, it order to keep the same aspect ratio
					newVidHeight = (newVidWidth / origVidWidth) * origVidHeight;
				}
			}
			
			var x:int = (contWidth - newVidWidth) / 2;
			var y:int = (contHeight - newVidHeight) / 2;
			
			return new Rectangle(x, y, newVidWidth, newVidHeight);
		}
		
		private function calculateTopBlackRect(contWidth:int, contHeight:int, vidX:int, vidY:int, vidWidth:int, vidHeight:int):Rectangle {
			if (vidHeight < contHeight) {
				trace("**** calculateTopBlackRect TopRect cw=" + contWidth + ",ch=" + contHeight + " vidx=" + vidX 
					+ ",vidy=" + vidY + " vidw=" + vidWidth + ",vidh=" + vidHeight);
				// Display rectangle at top of video.
				return new Rectangle(0, 0, contWidth, vidY);
			} else {
				trace("**** calculateTopBlackRect LeftRect cw=" + contWidth + ",ch=" + contHeight + " vidx=" + vidX 
					+ ",vidy=" + vidY + " vidw=" + vidWidth + ",vidh=" + vidHeight);
				// Display rectangle on left of video
				return new Rectangle(0, 0, vidX, contHeight);
			}			
		}
		
		private function calculateBottomBlackRect(contWidth:int, contHeight:int, vidX:int, vidY:int, vidWidth:int, vidHeight:int):Rectangle {
			if (vidHeight < contHeight) {
				trace("**** calculateTopBlackRect BottomRect cw=" + contWidth + ",ch=" + contHeight + " vidx=" + vidX 
					+ ",vidy=" + vidY + " vidw=" + vidWidth + ",vidh=" + vidHeight);
				// Display rect at bottom of video
				return new Rectangle(0, vidY + vidHeight, contWidth, contHeight - (vidY + vidHeight));
			} else {
				trace("**** calculateTopBlackRect RightRect cw=" + contWidth + ",ch=" + contHeight + " vidx=" + vidX 
					+ ",vidy=" + vidY + " vidw=" + vidWidth + ",vidh=" + vidHeight);
				// Display rect at right of video
				return new Rectangle(vidX + vidWidth, 0, contWidth - (vidX + vidWidth), contHeight);
			}
			
		}
		
		private function positionRect(rect: RectCoverView, coord:Rectangle):void {
			rect.x = coord.x;
			rect.y = coord.y;
			rect.width = coord.width;
			rect.height = coord.height;
		}
	}
}
