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
package org.bigbluebutton.modules.deskShare.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.red5.Connection;
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.bigbluebutton.modules.deskShare.events.AppletStartedEvent;
	import org.bigbluebutton.modules.deskShare.events.StartViewingEvent;
	import org.bigbluebutton.modules.deskShare.events.ViewStreamEvent;
	
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
		
		private var dispatcher:Dispatcher;
		
		private var width:Number;
		private var height:Number;
		private var uri:String;
		
		public function DeskshareService()
		{
			this.dispatcher = new Dispatcher();			
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
							function(result:Object):void{
								if (result != null && (result as Boolean)){
									LogUtil.debug("Desk Share stream is streaming");
									checkVideoWidth();
									checkVideoHeight();
								}
							},
							function(status:Object):void{
								LogUtil.error("Error while trying to call remote mathod on server");
							}
									);
		}
			
		public function disconnect():void{
			nc.close();
		}
		
		private function connectionSuccessHandler(e:ConnectionEvent):void{
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
		public function appletStarted():void{
			LogUtil.debug("Got applet started");
			dispatcher.dispatchEvent(new AppletStartedEvent());
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
			try{
				deskSO.send("stopViewing");
			} catch(e:Error){
				LogUtil.error("could not send stop viewing notification");
			}
		}
		
		/**
		 * Sends a notification to the module to stop viewing the stream 
		 * This method is called on successful execution of sendStopViewingNotification()
		 * 
		 */		
		public function stopViewing():void{
			dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.STOP));
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
		
		/**
		 * Check what the width of the published video is
		 * This method is useful for clients which have joined a room where somebody is already publishing 
		 * 
		 */		
		public function checkVideoWidth():void{
			var widthResponder:Responder = new Responder(
							function(result:Object):void{
								if (result != null) width = result as Number;
							},
							function(status:Object):void{
								LogUtil.error("Error while trying to call remote mathod on server");
							}
								);
							
			nc.call("deskshare.getVideoWidth", widthResponder);
		}
		
		/**
		 * Check what the height of the published video is
		 * This method is useful for clients which have joined a room where somebody is already publishing 
		 * 
		 */		
		public function checkVideoHeight():void{
			var heightResponder:Responder = new Responder(
							function(result:Object):void{
								if (result != null){
									height = result as Number;
									var event:ViewStreamEvent = new ViewStreamEvent(ViewStreamEvent.START);
									event.videoWidth = width;
									event.videoHeight = height;
									dispatcher.dispatchEvent(event);
								} 
							},
							function(status:Object):void{
								LogUtil.error("Error while trying to call remote mathod on server");
							}
									);
									
			nc.call("deskshare.getVideoHeight", heightResponder);
		}
		
		public function calculateEncodingDimensions(captureWidth:Number, captureHeight:Number):void{
			height = captureHeight;
			width = captureWidth;
		}

	}
}