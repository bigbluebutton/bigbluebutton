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
package org.bigbluebutton.modules.deskShare.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.red5.Connection;
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.bigbluebutton.modules.deskShare.events.AppletStartedEvent;
	import org.bigbluebutton.modules.deskShare.events.StartViewingEvent;
	import org.bigbluebutton.modules.deskShare.events.StopViewingEvent;
	
	/**
	 * The DeskShareProxy communicates with the Red5 deskShare server application 
	 * @author Snap
	 * 
	 */	
	public class DeskShareProxy
	{
		private var module:DeskShareModule;
		
		private var conn:Connection;
		private var nc:NetConnection;
		private var deskSO:SharedObject;
		private var responder:Responder;
		
		private var dispatcher:Dispatcher;
		
		private var width:Number;
		private var height:Number;
		
		/**
		 * The constructor. 
		 * @param module - The DeskShareModule for which this class is a proxy
		 * 
		 */		
		public function DeskShareProxy(module:DeskShareModule)
		{
			this.module = module;
			this.dispatcher = new Dispatcher();
			
			conn = new Connection();
			conn.addEventListener(Connection.SUCCESS, connectionSuccessHandler);
			conn.addEventListener(Connection.FAILED, connectionFailedHandler);
			conn.addEventListener(Connection.REJECTED, connectionRejectedHandler);
			conn.setURI(module.uri);
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
		
		/**
		 * Called when the application starts
		 * @not implemented 
		 * 
		 */		
		public function start():void{
			
		}
		
		/**
		 * Called when the application stops
		 * @not implemented
		 * 
		 */		
		public function stop():void{
			sendStopViewingNotification();
			nc.close();
		}
		
		/**
		 * Called when a successful server connection is established 
		 * @param e
		 * 
		 */		
		private function connectionSuccessHandler(e:ConnectionEvent):void{
			nc = conn.getConnection();
			deskSO = SharedObject.getRemote("deskSO", module.uri, false);
            deskSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
            deskSO.client = this;
            deskSO.connect(nc);
            
            checkIfStreamIsPublishing();
		}
		
		/**
		 * Returns the connection object which this object is using to communicate to the Red5 server
		 * @return - The NetConnection object
		 * 
		 */		
		public function getConnection():NetConnection{
			return nc;
		}
		
		/**
		 * Called in case the connection to the server fails 
		 * @param e
		 * 
		 */		
		public function connectionFailedHandler(e:ConnectionEvent):void{
			LogUtil.error("connection failed to " + module.uri + " with message " + e.toString());
		}
		
		/**
		 * Called in case the connection is rejected 
		 * @param e
		 * 
		 */		
		public function connectionRejectedHandler(e:ConnectionEvent):void{
			LogUtil.error("connection rejected " + module.uri + " with message " + e.toString());
		}
		
		/**
		 * A sync handler for the deskShare Shared Objects 
		 * @param e
		 * 
		 */		
		public function sharedObjectSyncHandler(e:SyncEvent):void{
			
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
		public function startViewing(captureWidth:Number, captureHeight:Number):void{
			var e:StartViewingEvent = new StartViewingEvent();
			e.height = captureHeight;
			e.width = captureWidth;
			dispatcher.dispatchEvent(e);
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
			dispatcher.dispatchEvent(new StopViewingEvent());
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
									var e:StartViewingEvent = new StartViewingEvent();
									e.width = width;
									e.height = height;
									dispatcher.dispatchEvent(e);
								} 
							},
							function(status:Object):void{
								LogUtil.error("Error while trying to call remote mathod on server");
							}
									);
									
			nc.call("deskshare.getVideoHeight", heightResponder);
		}

	}
}