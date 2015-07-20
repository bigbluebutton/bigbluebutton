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
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.modules.broadcast.events.StreamsListLoadedEvent;
	import org.bigbluebutton.modules.broadcast.managers.BroadcastManager;
	
	public class StreamsService {
		private static const LOGGER:ILogger = getClassLogger(StreamsService);

		private var streamsXml:XML;
		
		private var broadcastManager:BroadcastManager;
		
		public function StreamsService(broadcastManager:BroadcastManager) {
			this.broadcastManager = broadcastManager;	
		}
		
		public function queryAvailableStreams(uri:String):void {
      		LOGGER.debug("StreamsService::queryAvailableStreams");
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
			
			urlLoader.load(new URLRequest(uri + "?a=" + date.time));			
		}		
		
		private function handleComplete(e:Event):void {
			streamsXml = new XML(e.target.data);
			LOGGER.debug(streamsXml);
			LOGGER.debug("StreamsService::handleComplete\n{0}", [streamsXml.toXMLString()]);
			var mn:XMLList = streamsXml.stream..@name;
			
			for each (var n:XML in mn) {
				LOGGER.debug(n);
			}
			var item:XML;
			var list:XMLList = streamsXml.children();

			for each(item in list) {
				LOGGER.debug("{0} {1} {2}", [item.@url, item.@name, item.@id]);
				broadcastManager.streams.streamNames.push(item.@name);
				broadcastManager.streams.streamUrls.push(item.@url);
				broadcastManager.streams.streamIds.push(item.@id);
			}			
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new StreamsListLoadedEvent(StreamsListLoadedEvent.STREAMS_LIST_LOADED));
		}
	}
}