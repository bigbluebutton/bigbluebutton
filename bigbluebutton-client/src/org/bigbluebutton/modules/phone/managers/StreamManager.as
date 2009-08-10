/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.phone.managers
{
	import flash.events.ActivityEvent;
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.bigbluebutton.modules.phone.events.MicMutedEvent;
	import org.bigbluebutton.modules.phone.events.MicrophoneUnavailEvent;
	import org.bigbluebutton.modules.phone.events.PlayStreamStatusEvent;
	
	public class StreamManager
	{
		public  var connection:NetConnection = null;
		private var incomingStream:NetStream = null
		private var outgoingStream:NetStream = null;
		private var publishName:String          = null;
		private var mic:Microphone 				= null;
		private var isCallConnected:Boolean			= false;
		private var muted:Boolean			    = false;
		private var localDispatcher:IEventDispatcher;
					
		public function StreamManager(dispatcher:IEventDispatcher)
		{			
			localDispatcher = dispatcher;
		}
	
		public function setConnection(connection:NetConnection):void {
			this.connection = connection;
		}
		
		public function initMicrophone():void {
			mic = Microphone.getMicrophone();
		
			if(mic == null){
				trace("No available microphone");
				var event:MicrophoneUnavailEvent = new MicrophoneUnavailEvent();
				localDispatcher.dispatchEvent(event);
			} else {
				mic.setUseEchoSuppression(true);
				mic.setLoopBack(false);
				mic.setSilenceLevel(0,20000);
				mic.gain = 60;
				mic.rate = 8;
				mic.addEventListener(ActivityEvent.ACTIVITY, micActivityHandler);
				mic.addEventListener(StatusEvent.STATUS, micStatusHandler);
			}
		}	
						
		private function micActivityHandler(event:ActivityEvent):void {}
	
		private function micStatusHandler(event:StatusEvent):void {
					
			switch(event.code) {
				case "Microphone.Muted":
					var mutedEvent:MicMutedEvent = new MicMutedEvent();
					mutedEvent.muted = true;
					localDispatcher.dispatchEvent(mutedEvent);
					break;
				case "Microphone.Unmuted":
					var unmutedEvent:MicMutedEvent = new MicMutedEvent();
					unmutedEvent.muted = false;
					localDispatcher.dispatchEvent(unmutedEvent);
					break;
				default:
				trace("unknown micStatusHandler event: " + event);
			}
		}
		
		public function mute():void {
			if(!muted) {
				if(outgoingStream != null) {
					outgoingStream.close();
					outgoingStream = null;
					muted = true;
				}
			}
		}
		
		public function unmute():void {
			if (muted) {
				outgoingStream = new NetStream(connection);
				outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
				outgoingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
				outgoingStream.attachAudio(mic);
				outgoingStream.publish(publishName, "live"); 
			
				var custom_obj:Object = new Object();
				custom_obj.onPlayStatus = playStatus;
				outgoingStream.client = custom_obj;
				muted = false;				
			}
		}
								
		public function callConnected(playStreamName:String, publishStreamName:String):void {
			isCallConnected = true;

			setupIncomingStream();
			setupOutgoingStream();					
			setupPlayStatusHandler();
			play(playStreamName);				
			publish(publishStreamName);									
		}
		
		private function play(playStreamName:String):void {
			incomingStream.play(playStreamName);
		}
		
		private function publish(publishStreamName:String):void {
			outgoingStream.publish(publishStreamName, "live");
		}
		
		private function setupIncomingStream():void {
			incomingStream = new NetStream(connection);
			incomingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			incomingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);			
		}
		
		private function setupOutgoingStream():void {
			outgoingStream = new NetStream(connection);
			outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			outgoingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
			outgoingStream.attachAudio(mic);
		}
		
		private function setupPlayStatusHandler():void {
			var custom_obj:Object = new Object();
			custom_obj.onPlayStatus = playStatus;
			incomingStream.client = custom_obj;
			outgoingStream.client = custom_obj;			
		}
			
		public function callDisconnected():void {
			if(incomingStream != null) {
				incomingStream.play(false); 
			}
			
			if(outgoingStream != null) {
				outgoingStream.attachAudio(null);
				outgoingStream.publish(null);
			}
				
			isCallConnected 		 = false;
		}

		private function netStatus (evt:NetStatusEvent ):void {		 

			var event:PlayStreamStatusEvent = new PlayStreamStatusEvent();
			
			switch(evt.info.code) {
			
				case "NetStream.Play.StreamNotFound":
					event.status = PlayStreamStatusEvent.PLAY_STREAM_STATUS_EVENT;
					break;
			
				case "NetStream.Play.Failed":
					event.status = PlayStreamStatusEvent.FAILED;
					break;
						
				case "NetStream.Play.Start":	
//					red5Manager.doStreamStatus("start");	
					event.status = PlayStreamStatusEvent.START;
					break;
						
				case "NetStream.Play.Stop":			
//					red5Manager.doStreamStatus("stop");	
					event.status = PlayStreamStatusEvent.STOP;
					break;
						
				case "NetStream.Buffer.Full":
					event.status = PlayStreamStatusEvent.BUFFER_FULL;
					break;
						
				default:
					
			}	
			localDispatcher.dispatchEvent(event);		 
		} 
			
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
	           trace("AsyncErrorEvent: " + event);
	    }
	        
	    private function playStatus(event:Object):void {
	    	// do nothing
	    }
			
	}
}