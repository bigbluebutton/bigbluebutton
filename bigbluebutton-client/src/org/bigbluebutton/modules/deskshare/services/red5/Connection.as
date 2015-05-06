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

package org.bigbluebutton.modules.deskshare.services.red5
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.EventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	import flash.net.Responder;
	import flash.net.SharedObject;
	import flash.utils.Timer;
	
	import mx.events.MetadataEvent;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.ClientStatusEvent;
	import org.bigbluebutton.main.model.users.AutoReconnect;
	import org.bigbluebutton.modules.deskshare.events.AppletStartedEvent;
	import org.bigbluebutton.modules.deskshare.events.CursorEvent;
	import org.bigbluebutton.modules.deskshare.events.ViewStreamEvent;

	
	public class Connection {
    public static const LOG:String = "Deskshare::Connection - ";
    
		private var nc:NetConnection;
		private var uri:String;
    private const connectionTimeout:int = 5000;
    private var retryTimer:Timer = null;
    private var retryCount:int = 0;
    private const MAX_RETRIES:int = 5;
    private var deskSO:SharedObject;
    private var responder:Responder;
    private var width:Number;
    private var height:Number;
    private var room:String;
    private var reconnect:AutoReconnect = new AutoReconnect();
    private var logoutOnUserCommand:Boolean = false;
    private var reconnecting:Boolean = false;
    
    private var dispatcher:Dispatcher = new Dispatcher();    

    public function Connection(room:String) {
      this.room = room;
      
      responder = new Responder(
        function(result:Object):void {
          if (result != null && (result.publishing as Boolean)){
            width = result.width as Number;
            height = result.height as Number;
            trace(LOG +  "Desk Share stream is streaming [" + width + "," + height + "]");
            var event:ViewStreamEvent = new ViewStreamEvent(ViewStreamEvent.START);
            event.videoWidth = width;
            event.videoHeight = height;
            dispatcher.dispatchEvent(event);
          } else {
            trace(LOG + "No deskshare stream being published");
            var connEvent:ConnectionEvent = new ConnectionEvent();
            connEvent.status = ConnectionEvent.NO_DESKSHARE_STREAM;
            dispatcher.dispatchEvent(connEvent);
          }
        },
        function(status:Object):void{
          var checkFailedEvent:ConnectionEvent = new ConnectionEvent();
          checkFailedEvent.status = ConnectionEvent.FAIL_CHECK_FOR_DESKSHARE_STREAM;
          dispatcher.dispatchEvent(checkFailedEvent);         
          trace(LOG + "Error while trying to call remote mathod on server");
        }
      );
    }
    
		public function connect(retry:Boolean = false):void {
      nc = new NetConnection();
			nc.proxyType = "best";
      nc.objectEncoding = ObjectEncoding.AMF0;
      nc.client = this;
      
      nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, debugAsyncErrorHandler);
      nc.addEventListener(NetStatusEvent.NET_STATUS, debugNetStatusHandler);
      nc.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
      nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
      
			if (getURI().length == 0){
				LogUtil.error(LOG + "please provide a valid URI connection string. URI Connection String missing");
				return;
			} else if (nc.connected){
				LogUtil.error(LOG + "You are already connected to " + getURI());
				return;
			}
      
      trace(LOG + "Trying to connect to [" + getURI() + "] retry=[" + retry + "]");
      if (! (retryCount > 0)) {
        var ce:ConnectionEvent = new ConnectionEvent();
        ce.status = ConnectionEvent.CONNECTING;
        
        dispatcher.dispatchEvent(ce);        
      }
   
			nc.connect(getURI(), UsersUtil.getInternalMeetingID());
      
      //if (!retry) {
      //  retryTimer = new Timer(connectionTimeout, 1);
      //  retryTimer.addEventListener(TimerEvent.TIMER_COMPLETE, connectTimeoutHandler);
      //  retryTimer.start();
      //}
		}
		
    private function connectTimeoutHandler(e:TimerEvent):void {
      trace(LOG + "Connection attempt to [" + getURI() + "] timedout. Retrying.");
      retryTimer.stop();
      retryTimer = null;
      
      nc.close();
      nc = null;
      
      var ce:ConnectionEvent = new ConnectionEvent();;
      
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        ce.status = ConnectionEvent.CONNECTING_RETRY;
        ce.retryAttempts = retryCount;
        dispatcher.dispatchEvent(ce);
        
        connect(false);
      } else {
        ce.status = ConnectionEvent.CONNECTING_MAX_RETRY;
        dispatcher.dispatchEvent(ce);
      }
      
    }
       
		public function close():void{
			nc.close();
		}
		
		public function setURI(p_URI:String):void{
			uri = p_URI;
		}
		
		public function getURI():String{
			return uri;
		}
		
		public function onBWCheck(... rest):Number { 
			return 0; 
		} 
		
		public function onBWDone(... rest):void { 
			var p_bw:Number; 
			if (rest.length > 0) p_bw = rest[0]; 
			// your application should do something here 
			// when the bandwidth check is complete 
			trace("bandwidth = " + p_bw + " Kbps."); 
		}
		
		private function netStatusHandler(event:NetStatusEvent):void {	
      trace(LOG + "Connected to [" + getURI() + "]. [" + event.info.code + "]");
      
      if (retryTimer) {
        retryCount = 0;
        trace("Cancelling retry timer.");
        retryTimer.stop();
        retryTimer = null;
      }
      
			var ce:ConnectionEvent = new ConnectionEvent();
			
			switch(event.info.code){
				case "NetConnection.Connect.Failed":
					if (reconnecting) {
						reconnect.onConnectionAttemptFailed();
					}
					ce.status = ConnectionEvent.FAILED;
          
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.Success":
          ce.status = ConnectionEvent.SUCCESS;
          if (reconnecting) {
            dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.SUCCESS_MESSAGE_EVENT, 
              "Connection reestablished", 
              "Deskshare connection has been reestablished successfully"));
            reconnecting = false;
          }
          dispatcher.dispatchEvent(ce);
          connectionSuccessHandler();
				break;
				
				case "NetConnection.Connect.Rejected":
          ce.status = ConnectionEvent.REJECTED;
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.Closed":
          trace(LOG + "Deskshare connection closed.");
          ce.status = ConnectionEvent.CLOSED;
          stopViewing();
          if (!logoutOnUserCommand) {
            dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.WARNING_MESSAGE_EVENT, 
              "Deskshare connection dropped", 
              "Attempting to reconnect"));
            reconnecting = true;
            reconnect.onDisconnect(connect);
          }
				break;
				
				case "NetConnection.Connect.InvalidApp":
          ce.status = ConnectionEvent.INVALIDAPP;
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.AppShutdown":
          ce.status = ConnectionEvent.APPSHUTDOWN;
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.NetworkChange":
					LogUtil.info("Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
          trace(LOG + "Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
					break;
					
				default :
					// I dispatch DISCONNECTED incase someone just simply wants to know if we're not connected'
					// rather than having to subscribe to the events individually
          ce.status = ConnectionEvent.DISCONNECTED;
          dispatcher.dispatchEvent(ce);
					break;
			}
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void{
      var ce:ConnectionEvent = new ConnectionEvent();
      ce.status = ConnectionEvent.SECURITYERROR;
      dispatcher.dispatchEvent(ce);
		}
    
    public function mouseLocationCallback(x:Number, y:Number):void {
      var event:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR_LOC_EVENT);
      event.x = x;
      event.y = y;
      dispatcher.dispatchEvent(event);
    }
    
    /**
     * Check if anybody is publishing the stream for this room 
     * This method is useful for clients which have joined a room where somebody is already publishing
     * 
     */		
    private function checkIfStreamIsPublishing(room: String):void{
      trace(LOG + "checking if desk share stream is publishing");
      var event:ConnectionEvent = new ConnectionEvent();
      event.status = ConnectionEvent.CHECK_FOR_DESKSHARE_STREAM;
      dispatcher.dispatchEvent(event);
      
      nc.call("deskshare.checkIfStreamIsPublishing", responder, room);
    }
    
    public function disconnect():void{
      logoutOnUserCommand = true;
      if (nc != null) nc.close();
    }
    
    public function connectionSuccessHandler():void{
      trace(LOG + "Successully connection to " + uri);
      var deskSOName:String = room + "-deskSO";
      deskSO = SharedObject.getRemote(deskSOName, uri, false);
      deskSO.client = this;
      deskSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, debugAsyncErrorHandler);
      deskSO.addEventListener(NetStatusEvent.NET_STATUS, debugNetStatusHandler);
      deskSO.connect(nc);
      
      checkIfStreamIsPublishing(room);
    }

    private function debugNetStatusHandler(e:NetStatusEvent):void {
      trace(LOG + "netStatusHandler target=" + e.target + " info=" + ObjectUtil.toString(e.info));
    }

    private function debugAsyncErrorHandler(e:AsyncErrorEvent):void {
      trace(LOG + "asyncErrorHandler target=" + e.target + " text=" + e.text);
    }
    
    public function getConnection():NetConnection{
      return nc;
    }
    
    public function connectionFailedHandler(e:ConnectionEvent):void{
      LogUtil.error("connection failed to " + uri + " with message " + e.toString());
      trace(LOG + "connection failed to " + uri + " with message " + e.toString());
    }
    
    public function connectionRejectedHandler(e:ConnectionEvent):void{
      LogUtil.error("connection rejected " + uri + " with message " + e.toString());
      trace(LOG + "connection rejected " + uri + " with message " + e.toString());
    }
    
    
    /**
     * Invoked on the server once the clients' applet has started sharing and the server has started a video stream 
     * 
     */		
    public function appletStarted(videoWidth:Number, videoHeight:Number):void{
      trace(LOG + "Got applet started");
      var event:AppletStartedEvent = new AppletStartedEvent();
      event.videoWidth = videoWidth;
      event.videoHeight = videoHeight;
      dispatcher.dispatchEvent(event);
    }
    
    /**
     * Call this method to send out a room-wide notification to start viewing the stream 
     * 
     */		
    public function sendStartViewingNotification(captureWidth:Number, captureHeight:Number):void{
      try{
        deskSO.send("startViewing", captureWidth, captureHeight);
      } catch(e:Error){
        LogUtil.error("error while trying to send start viewing notification");
      }
    }
    
    public function sendStartedViewingNotification(stream:String):void{
      trace(LOG + "Sending start viewing to server");
      nc.call("deskshare.startedToViewStream", null, stream);
    }
    
    public function stopSharingDesktop(meetingId: String, stream: String):void {
      nc.call("deskshare.stopSharingDesktop", null, meetingId);
    }
    
    /**
     * Called by the server when a notification is received to start viewing the broadcast stream .
     * This method is called on successful execution of sendStartViewingNotification()
     * 
     */		
    public function startViewing(videoWidth:Number, videoHeight:Number):void{
      trace(LOG + "startViewing invoked by server");
      
      var event:ViewStreamEvent = new ViewStreamEvent(ViewStreamEvent.START);
      event.videoWidth = videoWidth;
      event.videoHeight = videoHeight;
      dispatcher.dispatchEvent(event);
    }
    
    /**
     * Sends a notification through the server to all the participants in the room to stop viewing the stream 
     * 
     */		
    public function sendStopViewingNotification():void{
      trace(LOG + "Sending stop viewing notification to other clients.");
      try{
        deskSO.send("stopViewing");
      } catch(e:Error){
        trace(LOG + "could not send stop viewing notification");
      }
    }
    
    /**
     * Called by the server to notify clients that the deskshare stream has stooped.
     */
    public function deskshareStreamStopped():void {
      stopViewing();
    }
    
    /**
     * Sends a notification to the module to stop viewing the stream 
     * This method is called on successful execution of sendStopViewingNotification()
     * 
     */		
    public function stopViewing():void{
      trace(LOG + "Received dekskshareStreamStopped");
      dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.STOP));
    }
    
    
	}
}
