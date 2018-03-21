package org.bigbluebutton.air.screenshare.views {
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.NetStatusEvent;
	import flash.events.StageVideoAvailabilityEvent;
	import flash.events.StageVideoEvent;
	import flash.geom.Rectangle;
	import flash.media.StageVideo;
	import flash.media.StageVideoAvailability;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import spark.components.Group;
	
	public class ScreenshareDock extends Group {
		private var ns:NetStream;
		
		private var _conn:NetConnection;
		
		private var _streamId:String;
		
		private var _width:int;
		
		private var _height:int;
		
		private var _sv:StageVideo;
		
		private var _ssView:ScreenshareView;
		
		private var _stageVideoInUse:Boolean = false;
		
		private var _classicVideoInUse:Boolean = false;
		
		private var _played:Boolean = false;
		
		private var originalVideoWidth:Number;
		
		private var originalVideoHeight:Number;
		
		
		public function ScreenshareDock():void {
			// Constructor for SimpleStageVideo class 
			// Make sure the app is visible and stage available 
			trace("************ ScreenshareView: constructor");
			//addEventListener(Event.ADDED_TO_STAGE, onAddedToStage); 
			//this.visible = false;
		}
		
		private function onAddedToStage(event:Event):void {
			// Video Events 
			// the StageVideoEvent.STAGE_VIDEO_STATE informs you whether 
			// StageVideo is available 
			
			trace("************ ScreenshareView: STAGE VIDEO onAddedToStage ");
			stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);
		}
		
		private function onStageVideoState(event:StageVideoAvailabilityEvent):void {
			var available:Boolean = (event.availability == StageVideoAvailability.AVAILABLE);
			
			available = false; // for testing!!!
			
			trace("************ ScreenshareView: STAGE VIDEO available=" + available);
			// Detect if StageVideo is available and decide what to do in toggleStageVideo 
			toggleStageVideo(available);
		}
		
		private function toggleStageVideo(on:Boolean):void {
			ns = new NetStream(_conn);
			ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			ns.client = this;
			ns.bufferTime = 0;
			ns.receiveVideo(true);
			ns.receiveAudio(false);
			
			// To choose StageVideo attach the NetStream to StageVideo 
			if (on) {
				_stageVideoInUse = true;
				if (_sv == null) {
					trace("***** Using StageVideo length=" + stage.stageVideos.length);
					_sv = stage.stageVideos[0];
					var rect:Rectangle = new Rectangle(50, 80, 400, 300);
					_sv.viewPort = rect;
					_sv.addEventListener(StageVideoEvent.RENDER_STATE, stageVideoStateChange);
					_sv.attachNetStream(ns);
				}
				
				if (_classicVideoInUse) {
					// If you use StageVideo, remove from the display list the 
					// Video object to avoid covering the StageVideo object 
					// (which is always in the background) 
					stage.removeChild(_ssView);
					_classicVideoInUse = false;
				}
			} else {
				// Otherwise attach it to a Video object 
				if (_stageVideoInUse) {
					_stageVideoInUse = false;
				}
				
				trace("***** Using classic Video");
				_ssView = new ScreenshareView(ns);
				_classicVideoInUse = true;
				addElement(_ssView);
			}
			
			if (!_played) {
				_played = true;
				trace("***** Playing stream " + _streamId);
				ns.play(_streamId);
			}
		}
		
		private function stageVideoStateChange(event:StageVideoEvent):void {
			var status:String = event.status;
			trace("***** stageVideoStateChange " + status + ",codec=" + event.codecInfo + ",color=" + event.colorSpace);
			resize();
		}
		
		private function resize():void {
			//var rc = computeVideoRect(_sv.videoWidth, _sv.videoHeight);       
			//_sv.viewPort = rc;       
		}
		
		public function viewStream(conn:NetConnection, streamId:String, width:int, height:int):void {
			trace("************ ScreenshareView: viewing of screenshare streamId=" + streamId + " w=" + width + " h=" + height);
			_conn = conn;
			_streamId = streamId;
			_width = width;
			_height = height;
			
			if (stage == null) {
				trace("************ ScreenshareView: STAGE IS NULL!!!!!!!!");
			} else {
				stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);
			}
		}
		
		public function streamStopped(session:String, reason:String):void {
			trace("TODO: Need to implement stopping screenshare stream");
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
		}
		
		private function onNetStatus(e:NetStatusEvent):void {
			switch (e.info.code) {
				case "NetStream.Publish.Start":
					//					trace("NetStream.Publish.Start for broadcast stream " + streamName);
					break;
				case "NetStream.Play.UnpublishNotify":
					//					close();
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
		}
	
	}
}
