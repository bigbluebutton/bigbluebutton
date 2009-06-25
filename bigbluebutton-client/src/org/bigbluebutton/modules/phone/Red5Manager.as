package org.bigbluebutton.modules.phone {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.*;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	public class Red5Manager {
			
		[Bindable]
		public  var netConnection:NetConnection = null;
		private var incomingNetStream:NetStream = null;
		private var outgoingNetStream:NetStream = null;
		private var username:String;
		private var red5Url:String;
		private var uid:String;
		private var room:String;
		
		private var isConnected:Boolean = false;
		
		public function Red5Manager(uid:String, username:String, room:String, red5Url:String) {
			this.uid = uid;	
			this.username  = username;
			this.room = room;
			this.red5Url   = red5Url;
			this.init();
		}
		
		private function init():void {
			
			NetConnection.defaultObjectEncoding = flash.net.ObjectEncoding.AMF0;	
			netConnection = new NetConnection();
			netConnection.client = this;
			netConnection.addEventListener( NetStatusEvent.NET_STATUS , netStatus );
			netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
		}
		
		public function connectRed5():void {
			netConnection.connect(red5Url);
		}
		
		public function closeNetConnection():void {
			netConnection.close();
		}
		
		private function netStatus (evt:NetStatusEvent ):void {		 

			switch(evt.info.code) {
				
				case "NetConnection.Connect.Success":
					LogUtil.debug("Successfully connected to SIP application.");
					this.doOpen();									
					break;
		
				case "NetConnection.Connect.Failed":
					LogUtil.error("Failed to connect to SIP application.");
					break;
					
				case "NetConnection.Connect.Closed":
					LogUtil.error("Connection to SIP application has closed.");
				break;
		
				case "NetConnection.Connect.Rejected":
					LogUtil.error("Connection to SIP application was rejected.");
					break;
		
				case "NetStream.Play.StreamNotFound":
					break;
		
				case "NetStream.Play.Failed":
					this.doStreamStatus("failed");
					break;
					
				case "NetStream.Play.Start":	
					this.doStreamStatus("start");	
					break;
					
				case "NetStream.Play.Stop":			
					this.doStreamStatus("stop");	
					break;
					
				case "NetStream.Buffer.Full":
					break;
					
				default:
					
			}			 
		} 
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
           trace("AsyncErrorEvent: " + event);
        }
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
            trace("securityErrorHandler: " + event);
        }
        
     
        
        //********************************************************************************************
		//			
		//			CallBack Methods from Red5 
		//
		//********************************************************************************************

		public function registrationSucess(msg:String):* {
			LogUtil.debug("REGISTRATION to the SIP server Succeeded.");
			LogUtil.debug("Calling " + room);
			doCall(room);
		}
	
		public function registrationFailure(msg:String):* {
			LogUtil.error("REGISTRATION to the SIP server failed.");		
		}

		public function callState(msg:String):* {
			LogUtil.debug("RED5Manager callState " + msg);
	
			if (msg == "onUaCallClosed" ||  msg == "onUaCallFailed") {
				LogUtil.debug("Call has been disconnected.");
//				dispatchEvent (new CallDisconnectedEvent(CallDisconnectedEvent.DISCONNECTED,  msg));
				isConnected = false;
			}
			//missed call
			if (msg == "onUaCallCancelled") {
//				dispatchEvent (new MissedCallEvent(MissedCallEvent.CALLMISSED,  msg));
				isConnected = false;
				//if (incomingCall) {
					//SipCallWindow.close();
					//SipMissedCallWindow.show(displayName, incomingURL, "SIP Phone: Missed Call");
				//}
			}
		}
				
        public function connected(publishName:String, playName:String):* {
        	LogUtil.debug("Call has been connected");
		//	dispatchEvent (new CallConnectedEvent(CallConnectedEvent.CONNECTED, publishName,  playName));
			isConnected = true;
		}
				
		//********************************************************************************************
		//			
		//			SIP Actions
		//
		//********************************************************************************************
		
		
		public function doOpen():void {
			netConnection.call("open", null, uid, username);
		}
		
		public function doCall(dialStr:String):void {
			netConnection.call("call", null, uid, dialStr);
		}
		
		public function doCallChar(chr:String):void {
			if (isConnected) {
				netConnection.call("dtmf", null, uid, chr);
			}
		}
		
		public function doHangUp():void {
			netConnection.call("hangup", null, uid);
			if (isConnected) {
				isConnected = false;
			}
		}
		
		public function doAccept():void {
			netConnection.call("accept", null, uid);			
		}
		
		public function doStreamStatus(status:String):void {
			netConnection.call("streamStatus", null, uid, status);	
		}
		
		public function doClose1():void {
			netConnection.call("unregister", null, uid);	
		}
	}
}