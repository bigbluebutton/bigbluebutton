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
package org.bigbluebutton.modules.playback.model
{
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.common.red5.Connection;
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class RecordingProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "Recording Proxy";
		public static const RECORDING_URL:String = "Recording URL";
		
		private var conn:Connection;
		private var nc:NetConnection;
		private var recordingSO:SharedObject;
		private var uri:String;
		
		public function RecordingProxy(url:String)
		{
			super(NAME);
			conn = new Connection();
			this.uri = url;
			conn.addEventListener(Connection.SUCCESS, handleSuccessfulConnection);
			conn.addEventListener(Connection.FAILED, handleFailedConnection);
			conn.addEventListener(Connection.DISCONNECTED, handleDisconnection);
			conn.setURI(this.uri);
			conn.connect();
		}
		
		private function handleSuccessfulConnection(e:ConnectionEvent):void{
			nc = conn.getConnection();
			startRecording();
		}
		
		private function handleFailedConnection(e:ConnectionEvent):void{
			
		}
		
		private function handleDisconnection(e:ConnectionEvent):void{
			
		}
		
		public function startRecording():void{
//			var room:Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
//			nc.call("VCRStart", new Responder(gotStart, gotFault), Constants.red5Host, room.room );
		}
		
		public function stopRecording():void{
			nc.call("VCRStop", new Responder(gotStop, gotFault));
		}
		
		public function pauseRecording():void{
			nc.call("pauseRecording", new Responder(gotPause, gotFault));
		}
		
		public function gotStart(reult:Object):void{
			
		}
		
		public function gotStop(result:Object):void{
			Alert.show("got stop" + result);
			var recordingURL:String = result as String;
			sendNotification(RECORDING_URL, recordingURL);
		}
		
		public function gotPause(result:Object):void{
			
		}
		
		public function gotFault(fault:Object):void{
			Alert.show("error");
		}

	}
}