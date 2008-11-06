/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.listeners.model.service
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.listeners.model.vo.IListeners;
	import org.bigbluebutton.modules.listeners.model.vo.Listener;

	public class ListenersSOService implements IListenersService
	{
		public static const NAME:String = "ListenersSOService";
		
		private var _listenersSO : SharedObject;
		private static const SHARED_OBJECT:String = "meetMeUsersSO";
		
		private var _listeners:IListeners;
		private var netConnectionDelegate: NetConnectionDelegate;
		private var _msgListener:Function;
		private var _connectionListener:Function;
		private var _uri:String;
		
		public function ListenersSOService(listeners:IListeners)
		{			
			_listeners = listeners;						
		}
		
		public function connect(uri:String):void {
			_uri = uri;
			netConnectionDelegate = new NetConnectionDelegate(uri, connectionListener);
			netConnectionDelegate.connect();
		}
		
		public function disconnect():void {
			leave();
			netConnectionDelegate.disconnect();
		}
		
		private function connectionListener(connected:Boolean):void {
			if (connected) {
				trace(NAME + ":Connected to the VOice application");
				join();
			} else {
				leave();
				trace(NAME + ":Disconnected from the Voice application");
				notifyConnectionStatusListener(false);
			}
		}
		
	    private function join() : void
		{
			_listenersSO = SharedObject.getRemote(SHARED_OBJECT, _uri, false);
			_listenersSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_listenersSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_listenersSO.client = this;
			_listenersSO.connect(netConnectionDelegate.connection);
			trace(NAME + ":Voice is connected to Shared object");
			notifyConnectionStatusListener(true);			
		}
		
	    private function leave():void
	    {
	    	if (_listenersSO != null) _listenersSO.close();
	    }

		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionListener = connectionListener;
		}
		
		public function userJoin(userId:Number, cidName:String, cidNum:String, 
									muted:Boolean, talking:Boolean):void
		{
			if (! _listeners.hasListener(userId)) {
				var n:Listener = new Listener();
				n.callerName = (cidName != null) ? cidName : "<Unknown Caller>";
				n.callerNumber = cidNum;
				n.muted = muted;
				n.userid = userId;
				n.talking = talking;
				trace("Add listener with userid " + userId + " to the conference.");
				_listeners.addListener(n);
			} else {
				trace("There is a listener with userid " + userId + " " + cidName + " in the conference.");
			}
		}

		public function userMute(userId:Number, mute:Boolean):void
		{
			var l:Listener = _listeners.getListener(userId);			
			if (l != null) {
				l.muted = mute;
			}
			
			// sendNewMeetMeEvent();?????		
		}

		public function userTalk(userId:Number, talk:Boolean) : void
		{
			var l:Listener = _listeners.getListener(userId);			
			if (l != null) {
				l.talking = talk;
			}
			
			// sendNewMeetMeEvent();?????		
		}

		public function userLeft(userId:Number):void
		{
			_listeners.removeListener(userId);	
		}
		
		public function muteUnmuteUser(userid:Number, mute:Boolean):void
		{
			netConnectionDelegate.muteUnmuteUser(userid, mute);		
		}

		public function muteAllUsers(mute:Boolean):void
		{	
			netConnectionDelegate.muteAllUsers(mute);			
		}
		
		public function ejectUser(userId:Number):void
		{
			netConnectionDelegate.ejectUser(userId);			
		}
		
		public function getMeetMeUsers(meetmeUser:Object):void
		{			
			for(var items:String in meetmeUser) 
			{
				var userId:Number = meetmeUser[items][0];
				var cidName:String = meetmeUser[items][1];	
				var cidNum:String  = meetmeUser[items][2];
				var muted:Boolean = meetmeUser[items][3];
				var talking:Boolean = meetmeUser[items][4];
				trace("in getMeetMeUsers for user " + userId);
				userJoin(userId, cidName, cidNum, muted, talking);
			}
		}
		
		private function notifyConnectionStatusListener(connected:Boolean):void {
			if (_connectionListener != null) {
				trace('notifying connectionListener for Voice');
				_connectionListener(connected);
			} else {
				trace("_connectionListener is null");
			}
		}

		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			var statusCode : String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					trace(NAME + ":Connection Success");
					// Query the server for the current listners.
					var nc_responder : Responder;
					nc_responder = new Responder(getMeetMeUsers, null);	
					netConnectionDelegate.getCurrentListeners(nc_responder);	
					notifyConnectionStatusListener(true);			
					break;
			
				case "NetConnection.Connect.Failed" :			
					trace(NAME + ":Connection to voice SO failed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Closed" :									
					trace(NAME + ":Connection to voice SO closed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					trace(NAME + ":Voice application not found on server");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					trace(NAME + ":Voice application has been shutdown");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Rejected" :
					trace(NAME + ":No permissions to connect to the voice application" );
					notifyConnectionStatusListener(false);
					break;
					
				default :
				   trace(NAME + ":default - " + event.info.code );
				   notifyConnectionStatusListener(false);
				   break;
			}
		}
			
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			trace( "VoiceSO asyncErrorHandler " + event.error);
			notifyConnectionStatusListener(false);
		}
	}
}