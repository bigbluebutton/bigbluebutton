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
package org.bigbluebutton.modules.broadcast.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.broadcast.events.StreamsListLoadedEvent;
	import org.bigbluebutton.modules.broadcast.managers.BroadcastManager;
	import org.bigbluebutton.modules.broadcast.models.Streams;
	
	public class StreamsService {
		private var streamsXml:XML;
		
		private var broadcastManager:BroadcastManager;
		
		public function StreamsService(broadcastManager:BroadcastManager) {
			this.broadcastManager = broadcastManager;	
		}
		
		public function queryAvailableStreams(uri:String):void {
      trace("StreamsService::queryAvailableStreams");
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
			
			urlLoader.load(new URLRequest(uri + "?a=" + date.time));			
		}		
		
		private function handleComplete(e:Event):void {
			streamsXml = new XML(e.target.data);
			LogUtil.debug(streamsXml);
      trace("StreamsService::handleComplete\n" + streamsXml.toXMLString());
			var mn:XMLList = streamsXml.stream..@name;
			
			for each (var n:XML in mn) {
				LogUtil.debug(n);
			}
			var item:XML;
			var list:XMLList = streamsXml.children();

			for each(item in list) {
				LogUtil.debug(item.@url + " " + item.@name + " " + item.@id);
				broadcastManager.streams.streamNames.push(item.@name);
				broadcastManager.streams.streamUrls.push(item.@url);
				broadcastManager.streams.streamIds.push(item.@id);
			}			
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new StreamsListLoadedEvent(StreamsListLoadedEvent.STREAMS_LIST_LOADED));
		}
	}
}