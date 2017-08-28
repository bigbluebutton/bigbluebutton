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
package org.bigbluebutton.core.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.NetDataEvent;
	import flash.events.NetMonitorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.StatusEvent;
	import flash.events.TimerEvent;
	import flash.net.NetMonitor;
	import flash.net.NetStream;
	import flash.utils.Dictionary;
	import flash.utils.Timer;
	import flash.utils.describeType;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.main.model.NetworkStatsData;
	
	public class StreamMonitor
	{
		/**
		 * https://github.com/ritzalam/red5-bw-check
		 * http://help.adobe.com/en_US/as3/dev/WS901d38e593cd1bac-1201e73713000d1f624-8000.html
		 * http://www.adobe.com/devnet/video/articles/media-measurement-flash.html
		 * http://help.adobe.com/en_US/air/reference/html/flash/net/NetMonitor.html
		 * http://help.adobe.com/en_US/flashmediaserver/devguide/WSae44d1d92c7021ff-1f5381712889cd7b56-8000.html#WSae44d1d92c7021ff-1f5381712889cd7b56-7ff7
		 * http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/net/NetStreamInfo.html
		 * http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/net/NetStream.html
		 * http://help.adobe.com/en_US/FlashMediaServer/3.5_Deving/WS5b3ccc516d4fbf351e63e3d11a0773d56e-7ffa.html
		 * https://groups.google.com/d/topic/red5interest/PiUDeH6jZBQ/discussion
		 * http://flowplayer.electroteque.org/bwcheck
		 * http://code.google.com/p/flowplayer-plugins/
		 * http://osflash.org/pipermail/red5_osflash.org/2009-January/028906.html
		 */
		
		private static const LOGGER:ILogger = getClassLogger(StreamMonitor);

		private var _netmon:NetMonitor;
		private var _heartbeat:Timer = new Timer( 2000 );
		private var _globalDispatcher:Dispatcher = new Dispatcher();
		private var _totalBytesCounter:Dictionary = new Dictionary();
		
		public function StreamMonitor():void {
			//Create NetMonitor object 
			_netmon = new NetMonitor(); 
			_netmon.addEventListener( NetMonitorEvent.NET_STREAM_CREATE, newNetStream );
			
			//Start the heartbeat timer 
			_heartbeat.addEventListener( TimerEvent.TIMER, onHeartbeat ); 
			_heartbeat.start(); 
		}
		
		//On new NetStream 
		private function newNetStream(event:NetMonitorEvent):void  
		{ 
			log("New Netstream object: " + event); 
			var stream:NetStream = event.netStream; 
			log("Stream info: " + stream.info);
			stream.addEventListener(NetDataEvent.MEDIA_TYPE_DATA, onStreamData); 
			stream.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			stream.addEventListener(StatusEvent.STATUS, onStatus);			 
		} 
		 
		//On data events from a NetStream object 
		private function onStreamData(event:NetDataEvent):void { 
			var netStream:NetStream = event.target as NetStream; 
//			log("Data event from " + netStream.info.uri + " at " + event.timestamp); 
			log("Data event: " + event);
			switch(event.info.handler) { 
				case "onMetaData": 
					//handle metadata; 
					break; 
				case "onXMPData": 
					//handle XMP; 
					break; 
				case "onPlayStatus": 
					//handle NetStream.Play.Complete
					break;
				case "onImageData": 
					//handle image 
					break; 
				case "onTextData": 
					//handle text 
					break; 
				default: 
					//handle other events 
					break;
			} 
		} 
		 
		//On status events from a NetStream object 
		private function onNetStatus(event:NetStatusEvent):void { 
//			log("Status event from " + event.target.info.uri + " at " + event.target.time); 
			log("NetStatus event code: " + event.info.code);
			log("NetStatus event details: " + event.info.details);
			log("Stream info: " + event.target.info);
		}
		
		private function onStatus(event:StatusEvent):void {
			log("Status event code: " + event.code);
			log("Status event: " + event.target);
			log("Stream info: " + event.currentTarget);
		}
		
		private function isRemoteStream(stream:NetStream):Boolean {
			return (stream != null && stream.info != null && stream.info.resourceName != null);
		}
		
		//On heartbeat timer 
		private function onHeartbeat(event:TimerEvent):void { 
			var streams:Vector.<NetStream> = _netmon.listStreams();

			var download:Dictionary = new Dictionary();
			var upload:Dictionary = new Dictionary();

			download["byteCount"] = upload["byteCount"]
					= download["currentBytesPerSecond"] = upload["currentBytesPerSecond"] = 0;
			 
			for (var i:int = 0; i < streams.length; i++) {
				if (streams[i] == null || streams[i].info == null) {
					// stream info is null, returning
					continue;
				}
				
//				log("Heartbeat on " + streams[i].info);

				var remote:Boolean = isRemoteStream(streams[i]);
				var ref:Dictionary = (remote? download: upload);

				if (streams[i].info.uri == null) {
					//log("Stream URI is null, returning");
					continue;
				}
				var uri:String = streams[i].info.uri.toLowerCase();
				var pattern1:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)\/(?P<meeting>.+)/;
				var pattern2:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
				var result:Array;
				var protocol:String = "", server:String = "", app:String = "", meeting:String = ""; 
				if (uri.match(pattern1)) {
					result = pattern1.exec(uri);
					protocol = result.protocol;
					server = result.server;
					app = result.app;
					meeting = result.meeting;
				} else if (uri.match(pattern2)) {
					result = pattern2.exec(uri);
					protocol = result.protocol;
					server = result.server;
					app = result.app;
				} else {
					log("***** NO MATCH *****");
				}

				var props:XMLList = flash.utils.describeType(streams[i].info)..accessor;
				
				for each (var s:XML in props) {
					//log(s + ": " + streams[i].info[s]);
					if (s.@type == "Number") {
						var property:String = s.@name;
						var num:Number = 0;
						if (ref.hasOwnProperty(property))
							num = (ref[property] as Number);
						num += (streams[i].info[property] as Number);
						ref[property] = num;
					}
				}
				var streamName:String = app + "/" + (remote? streams[i].info.resourceName: "local");
				var streamsName:String = (ref.hasOwnProperty("streams")? ref["streams"] + ";":"") + streamName;
				ref["streams"] = streamsName;
				
				var totalReg:Object = new Object;
				totalReg.streamName = streamName;
				totalReg.remote = remote;
				totalReg.byteCount = streams[i].info["byteCount"];
				if (_totalBytesCounter.hasOwnProperty(streamName) && _totalBytesCounter[streamName].byteCount > totalReg.byteCount) {
					var curTime:Number = new Date().getTime();
					var newStreamName:String = streamName + "_" + curTime;
					_totalBytesCounter[streamName].streamName = newStreamName;
					_totalBytesCounter[newStreamName] = _totalBytesCounter[streamName];
					delete _totalBytesCounter[streamName];
				}
				_totalBytesCounter[streamName] = totalReg;
			}

			download["byteCount"] = upload["byteCount"] = 0;
			for each (var value:Object in _totalBytesCounter) {
				if (value.remote)
					download["byteCount"] += value.byteCount;
				else
					upload["byteCount"] += value.byteCount;
				//log(value.streamName + ": " + value.byteCount);
			}

//			var netstatsEvent:NetworkStatsEvent = new NetworkStatsEvent();
//			netstatsEvent.downloadStats = download;
//			netstatsEvent.uploadStats = upload;
//			_globalDispatcher.dispatchEvent(netstatsEvent);

			NetworkStatsData.getInstance().updateConsumedBW(download["currentBytesPerSecond"],
					upload["currentBytesPerSecond"],
					download["byteCount"],
					upload["byteCount"]);
		}
		
		static public function printDictionary(dict:Dictionary):void {
			for (var key:Object in dict) {
				LOGGER.debug(key + ": " + dict[key]);
			}
		}
		
		private function log(s:String):void {
			LOGGER.debug(s);
		}
	}
}
