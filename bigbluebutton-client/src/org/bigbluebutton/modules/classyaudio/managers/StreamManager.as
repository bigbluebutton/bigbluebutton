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

package org.bigbluebutton.modules.classyaudio.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.ActivityEvent;
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	import flash.media.SoundCodec;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.classyaudio.events.MicMutedEvent;
	import org.bigbluebutton.modules.classyaudio.events.PlayStreamStatusEvent;
	
	public class StreamManager
	{
		public  var connection:NetConnection = null;
		private var incomingStream:NetStream = null
		private var outgoingStream:NetStream = null;
		private var publishName:String          = null;
		private var mic:Microphone 				= null;
		private var isCallConnected:Boolean			= false;
		private var audioCodec:String = "SPEEX";
		private var dispatcher:Dispatcher;
		
		private var gain:Number = 60; //default gain for bbb
		
		private static const LOGGER:ILogger = getClassLogger(StreamManager);
					
		public function StreamManager()
		{			
			dispatcher = new Dispatcher();
		}
	
		public function setConnection(connection:NetConnection):void {
			this.connection = connection;
		}
		
		private function setupMicrophone():void {
			mic = Microphone.getMicrophone();
			
			if(mic == null){
				LOGGER.debug("No available microphone");
				return;
			}
			
			mic.addEventListener(ActivityEvent.ACTIVITY, micActivityHandler);
			mic.addEventListener(StatusEvent.STATUS, micStatusHandler);
			
			mic.setUseEchoSuppression(true);
			mic.setLoopBack(false);
			//mic.setSilenceLevel(0,20000);
			if (audioCodec == "SPEEX") {
				mic.encodeQuality = 6;
				mic.codec = SoundCodec.SPEEX;
				mic.framesPerPacket = 1;
				mic.rate = 16; 
				//mic.enableVAD = true;
				LOGGER.debug("codec=SPEEX,framesPerPacket=1,rate=16");
			} else {
				mic.codec = SoundCodec.NELLYMOSER;
				mic.rate = 8;
				LOGGER.debug("codec=NELLYMOSER,rate=8");
			}			
			//mic.gain = 60;			
		}
						
		private function micActivityHandler(event:ActivityEvent):void {}
	
		private function micStatusHandler(event:StatusEvent):void {
					
			switch(event.code) {
				case "Microphone.Muted":
					var mutedEvent:MicMutedEvent = new MicMutedEvent();
					mutedEvent.muted = true;
					dispatcher.dispatchEvent(mutedEvent);
					break;
				case "Microphone.Unmuted":
					var unmutedEvent:MicMutedEvent = new MicMutedEvent();
					unmutedEvent.muted = false;
					dispatcher.dispatchEvent(unmutedEvent);
					break;
				default:
				LOGGER.debug("unknown micStatusHandler event: " + event);
			}
		}
		
		public function mute():void {
			/*if(outgoingStream != null) {
				LOGGER.debug("***** Muting the mic.");
				//outgoingStream.close();
				//outgoingStream = null;
				//outgoingStream.attachAudio(null);
			}*/
			
			if (mic != null){
				LOGGER.debug("***** Muting the mic.");
				mic.setSilenceLevel(100, 0);
				//Save the gain for when the user becomes unmuted
				//this.gain = mic.gain;
				mic.gain = 0;
			}
			
		}
		
		public function unmute():void {
			LOGGER.debug("***** UNMuting the mic.");
			//outgoingStream = new NetStream(connection);
			//outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			//outgoingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
			//setupMicrophone();
			//outgoingStream.attachAudio(mic);
			//outgoingStream.publish(publishName, "live"); 
			
			//var custom_obj:Object = new Object();
			//custom_obj.onPlayStatus = playStatus;
			//outgoingStream.client = custom_obj;
				
			if (mic != null){
				mic.setSilenceLevel(0, 20000);
				//Load the saved gain.
				mic.gain = this.gain;
			}
			
		}
								
		public function callConnected(playStreamName:String, publishStreamName:String, codec:String):void {
			LOGGER.debug("SM callConnected");
			isCallConnected = true;
			audioCodec = codec;
			setupIncomingStream();
			LOGGER.debug("SM callConnected: Incoming Stream Setup");
			setupOutgoingStream();
			LOGGER.debug("SM callConnected: Setup Outgoing Stream");
			LOGGER.debug("SM callConnected: Setup Stream(s)");
			setupPlayStatusHandler();
			LOGGER.debug("SM callConnected: After setupPlayStatusHandler");
			play(playStreamName);
			LOGGER.debug("SM callConnected: After play");
			publish(publishStreamName);
			LOGGER.debug("SM callConnected: Published Stream"); 
		}
		
		private function play(playStreamName:String):void {			
			incomingStream.play(playStreamName);
		}
		
		private function publish(publishStreamName:String):void {
			LOGGER.debug("Publishing stream " + publishStreamName);
			if (mic != null)
				outgoingStream.publish(publishStreamName, "live");
			else
				LOGGER.debug("SM publish: No Microphone to publish");
		}
		
		private function setupIncomingStream():void {
			incomingStream = new NetStream(connection);
			incomingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatusIncoming);
			incomingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			/*
			 * Set the bufferTime to 0 (zero) for live stream as suggested in the doc.
			 * http://help.adobe.com/en_US/FlashPlatform/beta/reference/actionscript/3/flash/net/NetStream.html#bufferTime
			 * If we don't, we'll have a long audio delay when a momentary network congestion occurs. When the congestion
			 * disappears, a flood of audio packets will arrive at the client and Flash will buffer them all and play them.
			 * http://stackoverflow.com/questions/1079935/actionscript-netstream-stutters-after-buffering
			 * ralam (Dec 13, 2010)
			 */
			incomingStream.bufferTime = 0;			
		}
		
		private function setupOutgoingStream():void {
			outgoingStream = new NetStream(connection);
			outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatusOutgoing);
			outgoingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
			setupMicrophone();
			outgoingStream.attachAudio(mic);
			unmute();
		}
		
		private function setupPlayStatusHandler():void {
			var custom_obj:Object = new Object();
			custom_obj.onPlayStatus = playStatus;
			custom_obj.onMetadata = onMetadata;
			incomingStream.client = custom_obj;
			if (mic != null)
				outgoingStream.client = custom_obj;			
		}
			
		public function stopStreams():void {
			LOGGER.debug("Stopping Stream(s)");
			if(incomingStream != null) {
				LOGGER.debug("--Stopping Incoming Stream");
				incomingStream.play(false); 
			} else {
				LOGGER.debug("--Incoming Stream Null");
			}
			
			if(outgoingStream != null) {
				LOGGER.debug("--Stopping Outgoing Stream");
				outgoingStream.attachAudio(null);
				outgoingStream.close();
			} else {
				LOGGER.debug("--Outgoing Stream Null");
			}
				
			isCallConnected = false;
			LOGGER.debug("Stopped Stream(s)");
		}

		private function netStatusIncoming (evt:NetStatusEvent ):void {		 

			var event:PlayStreamStatusEvent = new PlayStreamStatusEvent();
			LOGGER.debug("StreamManager:NetStream: " + evt.info.code);
			
			switch(evt.info.code) {
			
				case "NetStream.Play.StreamNotFound":
					event.status = PlayStreamStatusEvent.PLAY_STREAM_STATUS_EVENT;
					break;
			
				case "NetStream.Play.Failed":
					event.status = PlayStreamStatusEvent.FAILED;
					break;
						
				case "NetStream.Play.Start":	
					event.status = PlayStreamStatusEvent.START;
					break;
						
				case "NetStream.Play.Stop":			
					event.status = PlayStreamStatusEvent.STOP;
					break;
						
				case "NetStream.Buffer.Full":
					event.status = PlayStreamStatusEvent.BUFFER_FULL;
					break;
						
				default:
					
			}	
			dispatcher.dispatchEvent(event);	
		} 
		
		private function netStatusOutgoing (evt:NetStatusEvent ):void {		 
			
			var event:PlayStreamStatusEvent = new PlayStreamStatusEvent();
			LOGGER.debug("StreamManager: NetStream: " + evt.info.code);
			
			switch(evt.info.code) {
				
				case "NetStream.Play.StreamNotFound":
					event.status = PlayStreamStatusEvent.PLAY_STREAM_STATUS_EVENT;
					break;
				
				case "NetStream.Play.Failed":
					event.status = PlayStreamStatusEvent.FAILED;
					break;
				
				case "NetStream.Play.Start":	
					event.status = PlayStreamStatusEvent.START;
					break;
				
				case "NetStream.Play.Stop":			
					event.status = PlayStreamStatusEvent.STOP;
					break;
				
				case "NetStream.Buffer.Full":
					event.status = PlayStreamStatusEvent.BUFFER_FULL;
					break;
				
				default:
					
			}	
			dispatcher.dispatchEvent(event);		 
		} 
			
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
	    	LOGGER.debug("StreamManager: AsyncErrorEvent: " + event);
	    }
	        
	    private function playStatus(event:Object):void {
	    	// do nothing
	    }
		
		private function onMetadata(event:Object):void {
	    	LOGGER.debug("Recieve ON METADATA from SIP");
	    }	
	}
}