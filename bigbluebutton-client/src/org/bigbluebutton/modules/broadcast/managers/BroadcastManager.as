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
package org.bigbluebutton.modules.broadcast.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.broadcast.models.BroadcastOptions;
	import org.bigbluebutton.modules.broadcast.models.Stream;
	import org.bigbluebutton.modules.broadcast.models.Streams;
	import org.bigbluebutton.modules.broadcast.services.BroadcastService;
	import org.bigbluebutton.modules.broadcast.services.StreamsService;
	import org.bigbluebutton.modules.broadcast.views.BroadcastWindow;
	
	public class BroadcastManager {	
		private static const LOGGER:ILogger = getClassLogger(BroadcastManager);

		private var broadcastWindow:BroadcastWindow;
		private var dispatcher:Dispatcher;
		private var broadcastService:BroadcastService = new BroadcastService();
		private var streamService:StreamsService;
		private var opt:BroadcastOptions;
    
		[Bindable]
		public var streams:Streams = new Streams();	
		private var curStream:Stream;
		
		public function BroadcastManager() {
			streamService = new StreamsService(this);
			LOGGER.debug("BroadcastManager Created");
		}
		
		public function start():void {
			LOGGER.debug("BroadcastManager Start");
      opt = new BroadcastOptions();
			dispatcher = new Dispatcher();
      streamService.queryAvailableStreams(opt.streamsUri);
		}
		
    public function handleStreamsListLoadedEvent():void {
      if (broadcastWindow == null){
        LOGGER.debug("*** BroadcastManager Opening BroadcastModule Window");

        broadcastWindow = new BroadcastWindow();
        broadcastWindow.options = opt;
        broadcastWindow.streams = streams;
        
        broadcastWindow.broadcastManager = this;
        
        var e:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
        e.window = broadcastWindow;
        dispatcher.dispatchEvent(e);
        
      } else {
		LOGGER.debug("***BroadcastManager Not Opening BroadcastModule Window");
      }
      
      sendWhatIsTheCurrentStreamRequest();
      
      if (UsersUtil.amIPresenter()) {
        handleSwitchToPresenterMode();
      } else {
        handleSwitchToViewerMode();
      }
    }
    
		public function handleSwitchToPresenterMode():void {
      if (broadcastWindow != null) {
        broadcastWindow.becomePresenter();        
      }
		}
		
		public function handleSwitchToViewerMode():void {
      if (broadcastWindow != null) {
        broadcastWindow.becomeViewer();
      }
			
		}
		
		public function playVideo(index:int):void {
			LOGGER.debug("BroadcastManager::playVideo [{0}],[{1}],[{2}]", [streams.streamUrls[index], streams.streamIds[index], streams.streamNames[index]]); 
			broadcastService.playStream(streams.streamUrls[index], streams.streamIds[index], streams.streamNames[index]);
		}
				
		public function stopVideo():void {
			LOGGER.debug("BroadcastManager::stopVideo"); 
			broadcastService.stopStream();
		}
		
		public function sendWhatIsTheCurrentStreamRequest():void {
			broadcastService.sendWhatIsTheCurrentStreamRequest();
		}
		
		public function handleWhatIsTheCurrentStreamRequest(event:BBBEvent):void {
			LOGGER.debug("BroadcastManager:: handleWhatIsTheCurrentStreamRequest {0}", [event.payload["requestedBy"]]);
			var isPresenter:Boolean = UsersUtil.amIPresenter();
			if (isPresenter && curStream != null) {
				LOGGER.debug("MessageSender:: sendWhatIsTheCurrentStreamReply [{0},{1}]", [event.payload["requestedBy"], curStream.getStreamId()]);
				broadcastService.sendWhatIsTheCurrentStreamReply(event.payload["requestedBy"], curStream.getStreamId());
			}
		}
		
		public function handleWhatIsTheCurrentStreamReply(event:BBBEvent):void {
			LOGGER.debug("BroadcastManager:: handleWhatIsTheCurrentStreamReply [{0},{1}]",[event.payload["requestedBy"], event.payload["streamID"]]);
			var amIRequester:Boolean = UsersUtil.isMe(event.payload["requestedBy"]);
			LOGGER.debug("BroadcastManager:: handleWhatIsTheCurrentStreamReply [my id={0}, requester={1}]", 
        [UsersUtil.getMyUserID(), event.payload["requestedBy"]]);
			if (amIRequester) {
				var streamId:String = event.payload["streamID"];
				var info:Object = streams.getStreamNameAndUrl(streamId);
				if (info != null) {
					playStream(info["url"], streamId, info["name"]);
				}
			}
		}		
		
		private function playStream(url:String, streamId:String, streamName:String):void {
			LOGGER.debug("BroadcastManager::playStream [{0}], [{1}], [{2}]", [url, streamId, streamName]);
			curStream = new Stream(url, streamId, streamName);
			broadcastWindow.curStream = curStream;
			curStream.play(broadcastWindow);			
		}
		
		public function handlePlayStreamRequest(event:BBBEvent):void {
			LOGGER.debug("BroadcastManager Received {0}", [event.payload["messageID"]]);
			playStream(event.payload["uri"], event.payload["streamID"], event.payload["streamName"]);
		}
		
		public function handleStopStreamRequest(event:BBBEvent):void {
			LOGGER.debug("BroadcastManager Received {0}", [event.payload["messageID"]]);
			stopPlayingStream();
		}
		
		public function stopPlayingStream():void {
			if (curStream != null)	{
				curStream.stop();
				broadcastWindow.curStream = null;
				curStream == null;
			}	
		}
	}
}