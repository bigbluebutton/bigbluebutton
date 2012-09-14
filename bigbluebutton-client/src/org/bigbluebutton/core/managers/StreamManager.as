package org.bigbluebutton.core.managers
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
	import flash.utils.getDefinitionByName;
	import flash.utils.getQualifiedClassName;
	 
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.NetworkStatsEvent;
	
	public class StreamManager
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
		
		private static var _instance:StreamManager = null;
		private var _netmon:NetMonitor;
		private var _heartbeat:Timer = new Timer( 2000 );
		private var _globalDispatcher:Dispatcher = new Dispatcher();
		
		/**
		 * This class is a singleton. Please initialize it using the getInstance() method.
		 */		
		public function StreamManager(enforcer:SingletonEnforcer) {
			if (enforcer == null){
				throw new Error("There can only be 1 StreamManager instance");
			}
			initialize();
		}
		
		private function initialize():void {
			//Create NetMonitor object 
			_netmon = new NetMonitor(); 
			_netmon.addEventListener( NetMonitorEvent.NET_STREAM_CREATE, newNetStream );
			
			//Start the heartbeat timer 
			_heartbeat.addEventListener( TimerEvent.TIMER, onHeartbeat ); 
			_heartbeat.start(); 
		}
		
		/**
		 * Return the single instance of the StreamManager class
		 */
		public static function getInstance():StreamManager {
			if (_instance == null){
				_instance = new StreamManager(new SingletonEnforcer());
			}
			return _instance;
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
		
		//On heartbeat timer 
		private function onHeartbeat(event:TimerEvent):void { 
			var streams:Vector.<NetStream> = _netmon.listStreams();

			var download:Dictionary = new Dictionary();
			var upload:Dictionary = new Dictionary();
			 
			for (var i:int = 0; i < streams.length; i++) {
				var remote:Boolean = (streams[i].info.resourceName != null);
//				log("***** This is a " + (remote? "remote": "local") + " stream *****");
				var ref:Dictionary = (remote? download: upload);

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
							num = ref[property] as Number;
						num += (streams[i].info[property] as Number);
						ref[property] = num;
					}
				}
				var streamsName:String = app + "/" + (remote? streams[i].info.resourceName: "local");
				if (ref.hasOwnProperty("streams"))
					streamsName = ref["streams"] + ";" + streamsName;
				ref["streams"] = streamsName;
				
//				log("Heartbeat on " + streams[i].info/*.uri*/ + " at " + streams[i].time); 
//				log("Heartbeat: " + streams[i].info);
				//handle heartbeat event 
				
			}
			/*
			log("Download: " + (download["currentBytesPerSecond"] * 8)/1000 + "Kb/s");
			log("Download total: " + (download["byteCount"] * 8)/1000000 + "MB");
			log("Upload: " + (upload["currentBytesPerSecond"] * 8)/1000 + "Kb/s");
			log("Upload total: " + (upload["byteCount"] * 8)/1000000 + "MB");
			*/
			
			var netstatsEvent:NetworkStatsEvent = new NetworkStatsEvent();
			netstatsEvent.downloadStats = download;
			netstatsEvent.uploadStats = upload;
			_globalDispatcher.dispatchEvent(netstatsEvent);
		}
		
		static public function printDictionary(dict:Dictionary):void {
			for (var key:Object in dict) {
				LogUtil.debug(key + ": " + dict[key]);
			}
		}
		
		private function log(s:String):void {
			LogUtil.debug("[StreamManager] " + s);
		}
	}
}

class SingletonEnforcer{}