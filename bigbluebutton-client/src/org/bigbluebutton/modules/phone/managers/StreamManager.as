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

package org.bigbluebutton.modules.phone.managers {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.ActivityEvent;
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	import flash.media.MicrophoneEnhancedMode;
	import flash.media.MicrophoneEnhancedOptions;
	import flash.media.SoundCodec;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.api.JSLog;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.phone.PhoneOptions;
	import org.bigbluebutton.modules.phone.events.FlashMicAccessAllowedEvent;
	import org.bigbluebutton.modules.phone.events.FlashMicAccessDeniedEvent;
	import org.bigbluebutton.modules.phone.events.FlashMicUnavailableEvent;
	import org.bigbluebutton.modules.phone.events.MicrophoneUnavailEvent;
	import org.bigbluebutton.modules.phone.events.PlayStreamStatusEvent;
	
	public class StreamManager {
    private static const LOG:String = "Phone::StreamManager - ";
    
		private var incomingStream:NetStream = null
		private var outgoingStream:NetStream = null;
		private var publishName:String       = null;
		private var mic:Microphone 				   = null;		
  	private var micIndex:int 				     = 0;
    private var micName:String;
		private var isCallConnected:Boolean	 = false;
		private var muted:Boolean			       = false;
		private var audioCodec:String        = "SPEEX";
		private var dispatcher:Dispatcher;
		
    private var connManager:ConnectionManager;
    
		public function StreamManager(connMgr:ConnectionManager) {			
			dispatcher = new Dispatcher();
      connManager = connMgr;
//      useDefaultMic();
		}
	
    public function usePreferredMic(micIndex:int, micName:String):void {
      this.micIndex = micIndex;
      this.micName = micName;
      mic = Microphone.getMicrophone(micIndex);
      if(mic != null){
        trace(LOG + "Setting up preferred microphone [" + micName + "]");
        JSLog.debug(LOG + "Setting up preferred microphone [" + micName + "]");
        setupMicrophone();
        mic.addEventListener(StatusEvent.STATUS, micStatusHandler);
      }
    }
    
		public function useDefaultMic():void {
		  mic = Microphone.getMicrophone();
      
			if(mic != null){
				this.micIndex = mic.index;
				this.micName = mic.name;
			  trace(LOG + "Setting up default microphone [" + micName + "]");
        JSLog.debug(LOG + "Setting up default microphone [" + micName + "]");
				setupMicrophone();
				mic.addEventListener(StatusEvent.STATUS, micStatusHandler);
			}
		}	
		
		private function setupMicrophone():void {
			var phoneOptions:PhoneOptions = new PhoneOptions();

			if ((BBB.getFlashPlayerVersion() >= 10.3) && (phoneOptions.enabledEchoCancel)) {
				trace(LOG + "Using acoustic echo cancellation.");		
				mic = Microphone.getEnhancedMicrophone(micIndex);			
				var options:MicrophoneEnhancedOptions = new MicrophoneEnhancedOptions();
				options.mode = MicrophoneEnhancedMode.FULL_DUPLEX;
				options.autoGain = false;
				options.echoPath = 128;
				options.nonLinearProcessing = true;
				mic['enhancedOptions'] = options;
			} 
			
			mic.setUseEchoSuppression(true);
			mic.setLoopBack(false);
			mic.setSilenceLevel(0,20000);
      
			if (audioCodec == "SPEEX") {
				mic.encodeQuality = 6;
				mic.codec = SoundCodec.SPEEX;
				mic.framesPerPacket = 1;
				mic.rate = 16; 
				trace(LOG + "Using SPEEX whideband codec.");
			} else {
				mic.codec = SoundCodec.NELLYMOSER;
				mic.rate = 8;
				trace(LOG + "Using Nellymoser codec.");
			}			
		}
		
		public function initWithNoMicrophone(): void {
			var event:MicrophoneUnavailEvent = new MicrophoneUnavailEvent();
			dispatcher.dispatchEvent(event);
		}
							
		private function micStatusHandler(event:StatusEvent):void {					
			switch(event.code) {
				case "Microphone.Muted":
					dispatcher.dispatchEvent(new FlashMicAccessDeniedEvent(mic.name));
					break;
				case "Microphone.Unmuted":
					dispatcher.dispatchEvent(new FlashMicAccessAllowedEvent(mic.name));
					break;
				default:
					LogUtil.debug(LOG + "unknown micStatusHandler event: " + event);
			}
		}
										
		public function callConnected(playStreamName:String, publishStreamName:String, codec:String, listenOnlyCall:Boolean):void {
      JSLog.debug(LOG + "setting up streams. [" + playStreamName + "] : [" + publishStreamName + "] : [" + codec + "]");
      trace(LOG + "setting up streams. [" + playStreamName + "] : [" + publishStreamName + "] : [" + codec + "]");
			isCallConnected = true;
			audioCodec = codec;
			setupIncomingStream();

			if (mic != null && !listenOnlyCall) {
				setupOutgoingStream();
			} else {
        JSLog.debug(LOG + "not setting up an outgoing stream because I'm in listen only mode");
        trace(LOG + "not setting up an outgoing stream because I'm in listen only mode");
			}

			setupPlayStatusHandler();
			play(playStreamName);
			if (!listenOnlyCall) {
				publish(publishStreamName);
			} else {
				trace(LOG + "not publishing any stream because I'm in listen only mode");
        JSLog.debug(LOG + "not publishing any stream because I'm in listen only mode");
			}
		}
		
		private function play(playStreamName:String):void {		
			incomingStream.play(playStreamName);
		}
		
		private function publish(publishStreamName:String):void {
			if (mic != null) {
        outgoingStream.publish(publishStreamName, "live");
      } else {
        JSLog.debug(LOG + " publish: No Microphone to publish");
        trace(LOG + " publish: No Microphone to publish");
        dispatcher.dispatchEvent(new FlashMicUnavailableEvent());
      }     
		}
		
		private function setupIncomingStream():void {
      JSLog.debug(LOG + " setting up incoming stream");
      trace(LOG + " setting up incoming stream");
			incomingStream = new NetStream(connManager.getConnection());
			incomingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
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
			incomingStream.receiveAudio(true);
			incomingStream.receiveVideo(false);
		}
		
		private function setupOutgoingStream():void {
      JSLog.debug(LOG + " setting up outgoing stream");
      trace(LOG + " setting up outgoing stream");
			outgoingStream = new NetStream(connManager.getConnection());
			outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			outgoingStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
			setupMicrophone();
			outgoingStream.attachAudio(mic);
		}
		
		private function setupPlayStatusHandler():void {
			var custom_obj:Object = new Object();
			custom_obj.onPlayStatus = playStatus;
			custom_obj.onMetadata = onMetadata;
			incomingStream.client = custom_obj;
			if (mic != null && outgoingStream != null) {
				outgoingStream.client = custom_obj;
			}
		}
			
		public function stopStreams():void {
			trace(LOG + "Stopping Stream(s)");
			if(incomingStream != null) {
				trace(LOG + "--Stopping Incoming Stream");
        JSLog.debug(LOG + "--Stopping Incoming Stream");
        incomingStream.close(); 
			} else {
				trace(LOG + "--Incoming Stream Null");
        JSLog.debug(LOG + "--Incoming Stream Null");
			}
			
			if(outgoingStream != null) {
				trace(LOG + "--Stopping Outgoing Stream");
        JSLog.debug(LOG + "--Stopping Outgoing Stream");
				outgoingStream.attachAudio(null);
				outgoingStream.close();
			} else {
				trace(LOG + "--Outgoing Stream Null");
        JSLog.debug(LOG + "--Outgoing Stream Null");
			}
				
			isCallConnected = false;
			trace(LOG + "Stopped Stream(s)");
      JSLog.debug(LOG + "Stopped Stream(s)");
		}

		private function netStatus (evt:NetStatusEvent ):void {		 
			var event:PlayStreamStatusEvent = new PlayStreamStatusEvent();
      JSLog.debug(LOG + "******* evt.info.code  " + evt.info.code);
      trace(LOG + "******* evt.info.code  " + evt.info.code);
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
	     trace(LOG + "AsyncErrorEvent: " + event);
	  }
	        
	  private function playStatus(event:Object):void {
	    // do nothing
	  }
		
		private function onMetadata(event:Object):void {
	    	trace(LOG + "Recieve ON METADATA from SIP");
	    }	
	}
}
