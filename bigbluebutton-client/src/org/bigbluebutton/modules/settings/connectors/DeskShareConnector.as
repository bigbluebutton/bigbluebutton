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
package org.bigbluebutton.modules.settings.connectors
{	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.settings.util.Requirements;
		
	/**
	 * The DeskShareProxy communicates with the Red5 deskShare server application 
	 * @author Snap
	 * 
	 */	
	public class DeskShareConnector
	{	
		public static const CONNECT_SUCCESS:String = "NetConnection.Connect.Success";
		public static const CONNECT_FAILED:String = "NetConnection.Connect.Failed";
		public static const CONNECT_CLOSED:String = "NetConnection.Connect.Closed";
		public static const INVALID_APP:String = "NetConnection.Connect.InvalidApp";
		public static const APP_SHUTDOWN:String = "NetConnection.Connect.AppShutDown";
		public static const CONNECT_REJECTED:String = "NetConnection.Connect.Rejected";
		public static const NETSTREAM_PUBLISH:String = "NetStream.Publish.Start";
		
		public var nc:NetConnection;
		private var deskSO:SharedObject;
		private var responder:Responder;
		
		private var width:Number;
		private var height:Number;
		private var uri:String;
		
		public var room:String = Math.random().toString();;
		
		private var appletStartedCallback:Function;
		private var startViewingCallback:Function;
		private var stopViewingCallback:Function;
				
		public function DeskShareConnector(appletStartedCallback:Function, startViewingCallback:Function, stopViewingCallback:Function)
		{
			this.appletStartedCallback = appletStartedCallback;
			this.startViewingCallback = startViewingCallback;
			this.stopViewingCallback = stopViewingCallback;
			
			connect();
		}
		
		public function connect():void {
			this.uri = Requirements.bbb_deskshare_url + "/" + this.room;
			trace("Deskshare Service connecting to " + uri);
			nc = new NetConnection()
			nc.proxyType = "best";
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.connect(uri);
			
			responder = new Responder(
				function(result:Object):void{
					if (result != null && (result.publishing as Boolean)){
						width = result.width as Number;
						height = result.height as Number;
						trace("Desk Share stream is streaming [" + width + "," + height + "]");
						
						startViewingCallback(width, height);
					} else {
						trace("No deskshare stream being published");
					}
				},
				function(status:Object):void{
					trace("Error while trying to call remote mathod on server");
				}
			);
		}
		
		public function disconnect():void{
			if (nc != null) nc.close();
		}
		
		private function onNetStatus(e:NetStatusEvent):void{
			switch(e.info.code){
				case CONNECT_SUCCESS:
					connectionSuccessHandler();
					break;
				case CONNECT_FAILED:
					trace("VideoConnector::onNetStatus - connection to Video App failed");
					break;
				case CONNECT_CLOSED:
					trace("VideoConnector::onNetStatus - connection to Video App closed");
					break;
				case CONNECT_REJECTED:
					trace("VideoConnector::onNetStatus - connection to Video App rejected");
					break;
				case NETSTREAM_PUBLISH:
					
					break;
				default:
					trace("VideoConnector::onNetStatus - something else happened: " + e.info.code);
					break;
			}
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			trace("VideoConnector::onAsyncError - an async error occured on the video connection");
		}
		
		private function onSecurityError(e:SecurityErrorEvent):void{
			trace("VideoConnector::onSecurityError - a security error occured on the video connection");
		}
		
		private function onIOError(e:IOErrorEvent):void{
			trace("VideoConnector::onIOError - an IO error occured on the video connection");
		}
		
		private function connectionSuccessHandler():void{
			trace("Successully connection to " + uri);
			deskSO = SharedObject.getRemote("deskSO", uri, false);
			deskSO.client = this;
			deskSO.connect(nc);
			
			checkIfStreamIsPublishing();
		}
		
		public function getConnection():NetConnection{
			return nc;
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
			trace("Got applet started");
			
			appletStartedCallback(videoWidth, videoHeight);
		}
		
		/**
		 * Call this method to send out a room-wide notification to start viewing the stream 
		 * 
		 */		
		public function sendStartViewingNotification(captureWidth:Number, captureHeight:Number):void{
			try{
				deskSO.send("startViewing", captureWidth, captureHeight);
			} catch(e:Error){
				trace("error while trying to send start viewing notification");
			}
		}
		
		public function sendStartedViewingNotification():void{
			trace("Sending start viewing to server");
			nc.call("deskshare.startedToViewStream", null);
		}
		
		/**
		 * Called by the server when a notification is received to start viewing the broadcast stream .
		 * This method is called on successful execution of sendStartViewingNotification()
		 * 
		 */		
		public function startViewing(videoWidth:Number, videoHeight:Number):void{
			trace("startViewing invoked by server");
			
			startViewingCallback(videoWidth, videoHeight);
		}
		
		/**
		 * Sends a notification through the server to all the participants in the room to stop viewing the stream 
		 * 
		 */		
		public function sendStopViewingNotification():void{
			trace("Sending stop viewing notification to other clients.");
			try{
				deskSO.send("stopViewing");
			} catch(e:Error){
				trace("could not send stop viewing notification");
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
			trace("Received dekskshareStreamStopped");
			
			stopViewingCallback();
		}
		
		public function mouseLocationCallback(x:Number, y:Number):void {
			//var event:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR_LOC_EVENT);
			//event.x = x;
			//event.y = y;
			//dispatcher.dispatchEvent(event);
		}
		
		/**
		 * Check if anybody is publishing the stream for this room 
		 * This method is useful for clients which have joined a room where somebody is already publishing
		 * 
		 */		
		private function checkIfStreamIsPublishing():void{
			trace("checking if desk share stream is publishing");
			nc.call("deskshare.checkIfStreamIsPublishing", responder);
		}
		
		public function calculateEncodingDimensions(captureWidth:Number, captureHeight:Number):void{
			height = captureHeight;
			width = captureWidth;
		}
		
	}
}
