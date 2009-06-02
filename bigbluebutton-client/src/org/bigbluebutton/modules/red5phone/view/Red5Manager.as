package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.*;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	public class Red5Manager {
		private static const NAME:String = "Red5Manager";
			
		[Bindable]
		public  var netConnection:NetConnection = null;
		private var incomingNetStream:NetStream = null;
		private var outgoingNetStream:NetStream = null;
		
		private var username:String;
		private var password:String;
		private var red5Url:String;
		private var sipRealm:String;
		private var sipServer:String; 
		private var mailbox:String; 
		
		private var isConnected:Boolean = false;
		
		public function Red5Manager(username:String, password:String, red5Url:String, sipRealm:String, sipServer:String, mailbox:String) {	
			
			this.username  = username;
			this.password  = password;
			this.red5Url   = red5Url;
			this.sipRealm  = sipRealm;
			this.sipServer = sipServer
			this.mailbox   = mailbox;
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
					LogUtil.debug(NAME + " - NetConnection.Connect.Success");
					dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.NETSTAUS,  'Connection success'));
					this.doOpen();									
					break;
		
				case "NetConnection.Connect.Failed":
					LogUtil.debug(NAME + " - NetConnection.Connect.Failed");
					dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.NETSTAUS,  'Failed to connect to Red5'));
					break;
					
				case "NetConnection.Connect.Closed":
					LogUtil.debug(NAME + " - NetConnection.Connect.Closed");
					dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.NETSTAUS,  'Failed to connect to Red5'));
					break;
		
				case "NetConnection.Connect.Rejected":
					LogUtil.debug(NAME + " - NetConnection.Connect.Rejected");
					dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.NETSTAUS,  'Connection Rejected'));
					break;
		
				case "NetStream.Play.StreamNotFound":
					LogUtil.debug(NAME + " - NetConnection.Play.StreamNotFound");
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
					LogUtil.debug(NAME + " - NetStream.Buffer.Full");
					break;
					
				default:
					LogUtil.debug(NAME + " - default");
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
			dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.SIP_REGISTER,  "SUCCESS"));
		}
	
		public function registrationFailure(msg:String):* {
			dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.SIP_REGISTER,  msg));
		}
		
		public function callState(msg:String):* {
			LogUtil.debug("RED5Manager callState " + msg);
			dispatchEvent (new Red5MessageEvent(Red5MessageEvent.MESSAGE, Red5MessageEvent.CALLSTATE,  msg));
			
			if (msg == "onUaCallClosed" ||  msg == "onUaCallFailed") {
				dispatchEvent (new CallDisconnectedEvent(CallDisconnectedEvent.DISCONNECTED,  msg));
				isConnected = false;
			}
			//missed call
			if (msg == "onUaCallCancelled") {
				dispatchEvent (new MissedCallEvent(MissedCallEvent.CALLMISSED,  msg));
				isConnected = false;
				//if (incomingCall) {
					//SipCallWindow.close();
					//SipMissedCallWindow.show(displayName, incomingURL, "SIP Phone: Missed Call");
				//}
			}
		}
		
		public function incoming(source:String, sourceName:String, destination:String, destinationName:String):*  {		
			dispatchEvent (new IncomingCallEvent(IncomingCallEvent.INCOMING, source,  sourceName, destination, destinationName ));
		}
        
        public function connected(publishName:String, playName:String):* {
        	LogUtil.debug(NAME + " - connected[" + publishName + "," + playName + "]");
			dispatchEvent (new CallConnectedEvent(CallConnectedEvent.CONNECTED, publishName,  playName));
			isConnected = true;
		}
		
		public function mailBoxStatus(isWaitting:Boolean, newMessage:String, oldMessage:String):* {
			if(mailbox.length > 0) {
				dispatchEvent (new MailBoxStatusEvent(MailBoxStatusEvent.MAIBOXSTATUS, isWaitting,  newMessage, oldMessage));
			}
		}
		
		public function mailBoxCount(newMessage:String, oldMessage:String):* {
			if(mailbox.length > 0) {
				dispatchEvent (new MailBoxCountEvent(MailBoxCountEvent.MAIBOXCOUNT, newMessage,  oldMessage));
			}
		}
		
		
		//********************************************************************************************
		//			
		//			SIP Actions
		//
		//********************************************************************************************
		
		
		public function doOpen():void {
			netConnection.call("open", null, username, password, sipRealm, sipServer);
		}
		
		public function doCall(dialStr:String):void {
			netConnection.call("call", null, username, dialStr);
		}
		
		public function doCallChar(chr:String):void {
			if (isConnected) {
				netConnection.call("dtmf", null, username, chr);
			}
		}
		
		public function doHangUp():void {
			netConnection.call("hangup", null, username);
			if (isConnected) {
				isConnected = false;
			}
		}
		
		public function doAccept():void {
			netConnection.call("accept", null, username);			
		}
		
		public function doStreamStatus(status:String):void {
			LogUtil.debug("doStreamStatus[" + username + "," + status + "]");
			netConnection.call("streamStatus", null, username, status);	
		}
		
		//********************************************************************************************
		//			
		//			Asterisk Manager Actions
		//
		//********************************************************************************************
		
		public function doMialBoxStatus():void {
			if(mailbox.length > 0) {
				netConnection.call("vmStatus", null, mailbox);			
			}
		}
		
		public function doMailBoxCount():void {
			if(mailbox.length > 0) {
				netConnection.call("vmCount", null, mailbox);	
			}		
		}
	}
}