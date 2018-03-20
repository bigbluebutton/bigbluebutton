package org.bigbluebutton.air.screenshare.views
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.StageVideoAvailabilityEvent;
	import flash.media.StageVideoAvailability;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import mx.core.UIComponent;
	
	import spark.components.Group;

	public class ScreenshareView extends UIComponent
	{
		private var ns:NetStream;
		
		private var _video:Video;
		
		private var connection:NetConnection;
		
		private var userId:String;
		
		private var userName:String;
		
		private var streamName:String;
		
		private var originalVideoWidth:Number;
		
		private var originalVideoHeight:Number;

		public function ScreenshareView():void {
			_video = new Video();
			addChild(_video);			
		}
		
		private function onStageVideoState(event:StageVideoAvailabilityEvent):void       
		{
			var available:Boolean = (event.availability == StageVideoAvailability.AVAILABLE);
			trace("STAGE VIDEO available=" + available);
		}
		
		public function viewStream(conn:NetConnection, streamId:String, width:int, height:int):void {
			trace("TODO: Need to implement viewing of screenshare stream");
//			stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);
			ns = new NetStream(conn);
			ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			ns.client = this;
			ns.bufferTime = 0;
			ns.receiveVideo(true);
			ns.receiveAudio(false);
			_video.smoothing = true;
			_video.attachNetStream(ns);
			ns.play(streamId);
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
					trace("NetStream.Publish.Start for broadcast stream " + streamName);
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
	}
}