/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.deskshare.services
{
	import com.asfusion.mate.events.Dispatcher;	
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.RecordStatusEvent;
	import org.bigbluebutton.modules.deskshare.events.AppletStartedEvent;
	import org.bigbluebutton.modules.deskshare.events.CursorEvent;
	import org.bigbluebutton.modules.deskshare.events.ViewStreamEvent;
	import org.bigbluebutton.modules.deskshare.services.red5.Connection;
	import org.bigbluebutton.modules.deskshare.services.red5.ConnectionEvent;
	
	/**
	 * The DeskShareProxy communicates with the Red5 deskShare server application 
	 * @author Snap
	 * 
	 */	
	public class DeskshareService
	{	
		private var conn:Connection;
		private var nc:NetConnection;
		private var deskSO:SharedObject;
		private var responder:Responder;
		private var module:DeskShareModule;
		private var dispatcher:Dispatcher;
		
		private var width:Number;
		private var height:Number;
		private var uri:String;
		
		public function DeskshareService()
		{
			this.dispatcher = new Dispatcher();			
		}
		
		public function handleStartModuleEvent(module:DeskShareModule):void {
			LogUtil.debug("Deskshare Module starting");
			this.module = module;			
			connect(module.uri);
		}
		
		public function connect(uri:String):void {
			this.uri = uri;
			LogUtil.debug("Deskshare Service connecting to " + uri);
			conn = new Connection();
			conn.addEventListener(Connection.SUCCESS, connectionSuccessHandler);
			conn.addEventListener(Connection.FAILED, connectionFailedHandler);
			conn.addEventListener(Connection.REJECTED, connectionRejectedHandler);
			conn.setURI(uri);
			conn.connect();
			
			responder = new Responder(
							function(result:Object):void {
								if (result != null && (result.publishing as Boolean)){
									width = result.width as Number;
									height = result.height as Number;
									LogUtil.debug("Desk Share stream is streaming [" + width + "," + height + "]");
									var event:ViewStreamEvent = new ViewStreamEvent(ViewStreamEvent.START);
									event.videoWidth = width;
									event.videoHeight = height;
									dispatcher.dispatchEvent(event);
								} else {
									LogUtil.debug("No deskshare stream being published");
								}
							},
							function(status:Object):void{
								LogUtil.error("Error while trying to call remote mathod on server");
							}
									);
		}
			
		public function disconnect():void{
			if (nc != null) nc.close();
		}
		
		private function connectionSuccessHandler(e:ConnectionEvent):void{
			LogUtil.debug("Successully connection to " + uri);
			nc = conn.getConnection();
			deskSO = SharedObject.getRemote("deskSO", uri, false);
            deskSO.client = this;
            deskSO.connect(nc);
            
            checkIfStreamIsPublishing();
		}
			
		public function getConnection():NetConnection{
			return nc;
		}
			
		public function connectionFailedHandler(e:ConnectionEvent):void{
			LogUtil.error("connection failed to " + uri + " with message " + e.toString());
		}
			
		public function connectionRejectedHandler(e:ConnectionEvent):void{
			LogUtil.error("connection rejected " + uri + " with message " + e.toString());
		}
					
		/**
		 * Called by server when client connects.
		 */
		public function onBWDone():void{
			// do nothing
		}
		
		/**
		 * Invoked on the server once the clients' applet has started sharing and the server has started a video stream 
		 * 
		 */		
		public function appletStarted(videoWidth:Number, videoHeight:Number):void{
			LogUtil.debug("Got applet started");
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
		
		public function sendStartedViewingNotification():void{
			LogUtil.debug("Sending start viewing to server");
			nc.call("deskshare.startedToViewStream", null);
		}
		
		/**
		 * Called by the server when a notification is received to start viewing the broadcast stream .
		 * This method is called on successful execution of sendStartViewingNotification()
		 * 
		 */		
		public function startViewing(videoWidth:Number, videoHeight:Number):void{
			LogUtil.debug("startViewing invoked by server");
			
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
			LogUtil.debug("Sending stop viewing notification to other clients.");
			try{
				deskSO.send("stopViewing");
			} catch(e:Error){
				LogUtil.error("could not send stop viewing notification");
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
			LogUtil.debug("Received dekskshareStreamStopped");
			dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.STOP));
		}
		
		public function mouseLocationCallback(x:Number, y:Number):void {
			var event:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR_LOC_EVENT);
			event.x = x;
			event.y = y;
			dispatcher.dispatchEvent(event);
		}
		
		public function recordingStatusCallback(status:String):void {
			var event:RecordStatusEvent = new RecordStatusEvent();
			event.module = "DESKSHARE";
			event.status = status;
			dispatcher.dispatchEvent(event);
		}
		
		/**
		 * Check if anybody is publishing the stream for this room 
		 * This method is useful for clients which have joined a room where somebody is already publishing
		 * 
		 */		
		private function checkIfStreamIsPublishing():void{
			LogUtil.debug("checking if desk share stream is publishing");
			nc.call("deskshare.checkIfStreamIsPublishing", responder);
		}
				
		public function calculateEncodingDimensions(captureWidth:Number, captureHeight:Number):void{
			height = captureHeight;
			width = captureWidth;
		}

	}
}