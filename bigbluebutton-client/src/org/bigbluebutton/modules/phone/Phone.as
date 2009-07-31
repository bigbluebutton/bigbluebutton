package org.bigbluebutton.modules.phone
{
	import flash.events.ActivityEvent;
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	public class Phone
	{
		
		public  var netConnection:NetConnection = null;
		private var incomingNetStream:NetStream = null
		private var outgoingNetStream:NetStream = null;
		private var publishName:String          = null;
		private var mic:Microphone 				= null;
		private var isConnected:Boolean			= false;
		private var muted:Boolean			    = false;
					
		private var red5Manager:Red5Manager;
			
		public function Phone(red5Manager:Red5Manager)
		{
			this.red5Manager = red5Manager;
		}

		private function init():void {
			initMicrophone();
		}
				
		public function initMicrophone():void {
			mic = Microphone.getMicrophone();
		
			if(mic == null){
				trace("No available microphone");
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
					break;
				case "Microphone.Unmuted":
					break;
				default:
				trace("unknown micStatusHandler event: " + event);
			}
		}
			
		private function toggleMute():void {
			if(isConnected) {
				if(!muted) {
					if(outgoingNetStream != null) {
						outgoingNetStream.close();
						outgoingNetStream = null;
						muted = true;
					}
				}
				else {
					outgoingNetStream = new NetStream(getNetConnection());
					outgoingNetStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
					outgoingNetStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
					outgoingNetStream.attachAudio(mic);
					outgoingNetStream.publish(publishName, "live"); 
			
					var custom_obj:Object = new Object();
					custom_obj.onPlayStatus = playStatus;
					outgoingNetStream.client = custom_obj;
					muted = false;
				}
			}
		}
			
		private function getNetConnection():NetConnection {
			return red5Manager.netConnection;
		}
			
		private function setNetConnection(netConnection:NetConnection):void {
			this.netConnection = netConnection;
		}
			
		private function getPublishName():String {
			return publishName;
		}
			
		private function setPublishName(publishName:String):void {
			this.publishName = publishName;
		}
					
		public function callConnected(netConnection:NetConnection, playName:String, publishName:String):void {
			isConnected = true;
			setNetConnection(netConnection);
			setPublishName(publishName);
			incomingNetStream = new NetStream(netConnection);
			incomingNetStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			incomingNetStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
				
				
			outgoingNetStream = new NetStream(netConnection);
			outgoingNetStream.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
			outgoingNetStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
			outgoingNetStream.attachAudio(mic);
				
			var custom_obj:Object = new Object();
			custom_obj.onPlayStatus = playStatus;
			incomingNetStream.client = custom_obj;
			outgoingNetStream.client = custom_obj;
				
			incomingNetStream.play(playName); 
			outgoingNetStream.publish(publishName, "live"); 	
									
		}
			
		public function callDisconnected():void {
			if(incomingNetStream != null) {
				incomingNetStream.play(false); 
			}
			
			if(outgoingNetStream != null) {
				outgoingNetStream.attachAudio(null);
				outgoingNetStream.publish(null);
			}
				
			isConnected 		 = false;
		}

		private function netStatus (evt:NetStatusEvent ):void {		 

			switch(evt.info.code) {
			
				case "NetStream.Play.StreamNotFound":
					break;
			
				case "NetStream.Play.Failed":
					red5Manager.doStreamStatus("failed");
					break;
						
				case "NetStream.Play.Start":	
					red5Manager.doStreamStatus("start");	
					break;
						
				case "NetStream.Play.Stop":			
					red5Manager.doStreamStatus("stop");	
					break;
						
				case "NetStream.Buffer.Full":
					break;
						
				default:
					
			}			 
		} 
			
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
	           trace("AsyncErrorEvent: " + event);
	    }
	        
	    private function playStatus(event:Object):void {}
			
			
		private function doCall(dialedNumber:String):void {
			red5Manager.doCall(dialedNumber);
		}
						
		private function doHangUp():void {
			red5Manager.doHangUp();
				
			isConnected 		 = false;
		}
	}
}