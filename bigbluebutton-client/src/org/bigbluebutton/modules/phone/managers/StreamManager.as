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
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	import flash.media.MicrophoneEnhancedMode;
	import flash.media.MicrophoneEnhancedOptions;
	import flash.media.SoundCodec;
	import flash.net.NetStream;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.modules.phone.models.PhoneOptions;
	import org.bigbluebutton.modules.phone.events.FlashMicAccessAllowedEvent;
	import org.bigbluebutton.modules.phone.events.FlashMicAccessDeniedEvent;
	import org.bigbluebutton.modules.phone.events.FlashMicUnavailableEvent;
	import org.bigbluebutton.modules.phone.events.MicrophoneUnavailEvent;
	import org.bigbluebutton.modules.phone.events.PlayStreamStatusEvent;
	
	public class StreamManager {
		private static const LOGGER:ILogger = getClassLogger(StreamManager);
    
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
		LOGGER.debug("Setting up preferred microphone [{0}]", [micName]);
        setupMicrophone();
        mic.addEventListener(StatusEvent.STATUS, micStatusHandler);
      }
    }
    
		public function useDefaultMic():void {
		  mic = Microphone.getMicrophone();
      
			if(mic != null){
				this.micIndex = mic.index;
				this.micName = mic.name;
				LOGGER.debug("Setting up default microphone [{0}]", [micName]);
				setupMicrophone();
				mic.addEventListener(StatusEvent.STATUS, micStatusHandler);
			}
		}	
		
		private function setupMicrophone():void {
			var phoneOptions:PhoneOptions = Options.getOptions(PhoneOptions) as PhoneOptions;

			if ((BBB.getFlashPlayerVersion() >= 10.3) && (phoneOptions.enabledEchoCancel)) {
				LOGGER.debug("Using acoustic echo cancellation.");		
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
				LOGGER.debug("Using SPEEX whideband codec.");
			} else {
				mic.codec = SoundCodec.NELLYMOSER;
				mic.rate = 8;
				LOGGER.debug("Using Nellymoser codec.");
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
					LOGGER.debug("unknown micStatusHandler event: {0}", [event]);
			}
		}
										
		public function callConnected(playStreamName:String, publishStreamName:String, codec:String, listenOnlyCall:Boolean):void {
			LOGGER.debug("setting up streams. [{0}] : [{1}] : [{2}]", [playStreamName,publishStreamName,codec]);
			isCallConnected = true;
			audioCodec = codec;
			setupIncomingStream();

			if (mic != null && !listenOnlyCall) {
				setupOutgoingStream();
			} else {
				LOGGER.debug("not setting up an outgoing stream because I'm in listen only mode");
			}

			setupPlayStatusHandler();
			play(playStreamName);
			if (!listenOnlyCall) {
				publish(publishStreamName);
			} else {
				LOGGER.debug("not publishing any stream because I'm in listen only mode");
			}
		}
		
		private function play(playStreamName:String):void {		
			incomingStream.play(playStreamName);
		}
		
		private function publish(publishStreamName:String):void {
			if (mic != null) {
        outgoingStream.publish(publishStreamName, "live");
      } else {
		LOGGER.debug(" publish: No Microphone to publish");
        dispatcher.dispatchEvent(new FlashMicUnavailableEvent());
      }     
		}
		
		private function setupIncomingStream():void {
			LOGGER.debug(" setting up incoming stream");
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
      		LOGGER.debug(" setting up outgoing stream");
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
			LOGGER.debug("Stopping Stream(s)");
			if(incomingStream != null) {
				LOGGER.debug("Stopping Incoming Stream");
        incomingStream.close(); 
			} else {
				LOGGER.debug("Incoming Stream Null");
			}
			
			if(outgoingStream != null) {
				LOGGER.debug("Stopping Outgoing Stream");
				outgoingStream.attachAudio(null);
				outgoingStream.close();
			} else {
				LOGGER.debug("Outgoing Stream Null");
			}
				
			isCallConnected = false;
			LOGGER.debug("Stopped Stream(s)");
		}

		private function netStatus (evt:NetStatusEvent ):void {		 
			var event:PlayStreamStatusEvent = new PlayStreamStatusEvent();
			LOGGER.debug("******* evt.info.code {0}", [evt.info.code]);
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
	     LOGGER.error("AsyncErrorEvent: {0}", [event]);
	  }
	        
	  private function playStatus(event:Object):void {
	    // do nothing
	  }
		
		private function onMetadata(event:Object):void {
	    	LOGGER.debug("Recieve ON METADATA from SIP");
	    }	
	}
}
