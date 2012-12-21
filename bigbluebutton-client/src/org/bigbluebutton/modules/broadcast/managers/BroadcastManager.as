package org.bigbluebutton.modules.broadcast.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import mx.core.UIComponent;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.broadcast.models.BroadcastOptions;
	import org.bigbluebutton.modules.broadcast.models.Stream;
	import org.bigbluebutton.modules.broadcast.models.Streams;
	import org.bigbluebutton.modules.broadcast.services.BroadcastService;
	import org.bigbluebutton.modules.broadcast.services.StreamsService;
	import org.bigbluebutton.modules.broadcast.views.BroadcastWindow;
	
	public class BroadcastManager {	
		private var broadcastWindow:BroadcastWindow;
		private var dispatcher:Dispatcher;
		private var broadcastService:BroadcastService = new BroadcastService();
		private var streamService:StreamsService;
		
		[Bindable]
		public var streams:Streams = new Streams();	
		private var curStream:Stream;
		
		public function BroadcastManager() {
			streamService = new StreamsService(this);
			LogUtil.debug("BroadcastModule Created");
		}
		
		public function start():void {
			LogUtil.debug("BroadcastModule Start");
			dispatcher = new Dispatcher();
			if (broadcastWindow == null){
				trace("*** Opening BroadcastModule Window");
				var opt:BroadcastOptions = new BroadcastOptions();
								
				broadcastWindow = new BroadcastWindow();
				broadcastWindow.options = opt;
				broadcastWindow.streams = streams;
				
				broadcastWindow.broadcastManager = this;
				var options:BroadcastOptions = new BroadcastOptions();
				
				var e:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				e.window = broadcastWindow;
				dispatcher.dispatchEvent(e);
				streamService.queryAvailableStreams(options.streamsUri);
			} else {
				trace("*** Not Opening BroadcastModule Window");
			}
			
			sendWhatIsTheCurrentStreamRequest();
			
			if (UserManager.getInstance().getConference().amIPresenter()) {
				handleSwitchToPresenterMode();
			} else {
				handleSwitchToViewerMode();
			}
		}
		
		public function handleSwitchToPresenterMode():void {
			broadcastWindow.becomePresenter();
		}
		
		public function handleSwitchToViewerMode():void {
			broadcastWindow.becomeViewer();
		}
		
		public function playVideo(index:int):void {
      trace("BroadcastModule::playVideo [" + streams.streamUrls[index] + "],[" + streams.streamIds[index] + "],[" + streams.streamNames[index] + "]"); 
			broadcastService.playStream(streams.streamUrls[index], streams.streamIds[index], streams.streamNames[index]);
		}
				
		public function stopVideo():void {
      trace("BroadcastModule::stopVideo"); 
			broadcastService.stopStream();
		}
		
		public function sendWhatIsTheCurrentStreamRequest():void {
			broadcastService.sendWhatIsTheCurrentStreamRequest();
		}
		
		public function handleWhatIsTheCurrentStreamRequest(event:BBBEvent):void {
			trace("Received " + event.payload["messageID"] );
			var isPresenter:Boolean = UserManager.getInstance().getConference().amIPresenter();
			if (isPresenter && curStream != null) {
				broadcastService.sendWhatIsTheCurrentStreamReply(event.payload["requestedBy"], curStream.getStreamId());
			}
		}
		
		public function handleWhatIsTheCurrentStreamReply(event:BBBEvent):void {
			trace("Received " + event.payload["messageID"] );
			var amIRequester:Boolean = UserManager.getInstance().getConference().amIThisUser(event.payload["requestedBy"]);
			if (amIRequester) {
				var streamId:String = event.payload["streamID"];
				var info:Object = streams.getStreamNameAndUrl(streamId);
				if (info != null) {
					playStream(info["url"], streamId, info["name"]);
				}
			}
		}		
		
		private function playStream(url:String, streamId:String, streamName:String):void {
			curStream = new Stream(url, streamId, streamName);
			broadcastWindow.curStream = curStream;
			broadcastWindow.addDisplay();
			curStream.play(broadcastWindow);			
		}
		
		public function handlePlayStreamRequest(event:BBBEvent):void {
			trace("Received " + event.payload["messageID"]);
			playStream(event.payload["uri"], event.payload["streamID"], event.payload["streamName"]);
		}
		
		public function handleStopStreamRequest(event:BBBEvent):void {
			trace("Received " + event.payload["messageID"]);
			stopPlayingStream();
		}
		
		public function stopPlayingStream():void {
			broadcastWindow.removeDisplay();
			if (curStream != null)	{
				curStream.stop();
				broadcastWindow.curStream = null;
				curStream == null;
			}	
		}
	}
}