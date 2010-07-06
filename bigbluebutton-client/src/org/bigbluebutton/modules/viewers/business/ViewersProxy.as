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
package org.bigbluebutton.modules.viewers.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.NetConnection;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.videoconf.events.BroadcastStartedEvent;
	import org.bigbluebutton.modules.videoconf.events.BroadcastStoppedEvent;
	import org.bigbluebutton.modules.viewers.events.ConferenceCreatedEvent;
	import org.bigbluebutton.modules.viewers.events.ConnectionFailedEvent;
	import org.bigbluebutton.modules.viewers.events.LowerHandEvent;
	import org.bigbluebutton.modules.viewers.events.RaiseHandEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersConnectionEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleEndEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleStartedEvent;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	import org.bigbluebutton.common.LogUtil;

	public class ViewersProxy extends Proxy implements IProxy
	{
		private var module:ViewersModule;		
		private var _viewersService:ViewersSOService;
		private var _participants:Conference = null;
		private var joinService:JoinService;
		
		private var isPresenter:Boolean = false;
		
		private var dispatcher:Dispatcher;
				
		public function ViewersProxy(){
			dispatcher = new Dispatcher();
		}
		
		public function connect():void {	
			_viewersService = new ViewersSOService(module, _participants);
			LogUtil.debug(NAME + '::' + module.username + "," + module.role);
			_viewersService.connect(module.username, module.role, module.conference, module.mode, module.room, module.externUserID);		
		}

		public function join(e:ViewersModuleStartedEvent):void {
			module = e.module;
			
			LogUtil.debug(NAME + "::joining in ");
			joinService = new JoinService();
			joinService.addJoinResultListener(joinListener);
			joinService.load(module.host);
		}
		
		private function joinListener(success:Boolean, result:Object):void {
			LogUtil.debug("Got join result");
			if (success) {
				LogUtil.debug(NAME + '::Sending ViewersModuleConstants.JOIN_SUCCESS' + result.role);
				_participants = new Conference();
				_participants.me.name = result.username;
				_participants.me.role = result.role;
				_participants.me.room = result.room;
				_participants.me.authToken = result.authToken;
				
				module.conference = result.conference;
				module.username = _participants.me.name;
				module.role = _participants.me.role;
				module.room = _participants.me.room;
				module.authToken = _participants.me.authToken;
				module.mode = result.mode;
				module.webvoiceconf = result.webvoiceconf;
				module.voicebridge = result.voicebridge;
				module.conferenceName = result.conferenceName;
				module.welcome = result.welcome;
				module.meetingID = result.meetingID;
				module.externUserID = result.externUserID;
				
				if (result.record == 'true') {
					module.record = true;
				} else {
					module.record = false;
				}
				
				var e:ConferenceCreatedEvent = new ConferenceCreatedEvent(ConferenceCreatedEvent.CONFERENCE_CREATED_EVENT);
				e.conference = _participants;
				dispatcher.dispatchEvent(e);
				
				connect();
			} else {
				LogUtil.debug(NAME + '::Sending ViewersModuleConstants.JOIN_FAILED');
				var connectionEvent:ConnectionFailedEvent = new ConnectionFailedEvent();
				connectionEvent.reason = ConnectionFailedEvent.UNKNOWN_REASON;
				dispatcher.dispatchEvent(connectionEvent);
			}
		}
		
		public function connectSharedObjects(e:ViewersConnectionEvent):void{
			_viewersService.join(e.userid);
		}
		
		public function stop(e:ViewersModuleEndEvent):void {
			_viewersService.disconnect();
		}
		
		public function get me():BBBUser {
			return _participants.me;
		}
		
		public function isModerator():Boolean {
			if (me.role == "MODERATOR") {
				return true;
			}
			
			return false;
		}
		
		public function get participants():ArrayCollection {
			return _participants.users;
		}
		
		public function assignPresenter(assignTo:Number):void {
			_viewersService.assignPresenter(assignTo, me.userid);
		}
		
		public function addStream(e:BroadcastStartedEvent):void {
			_viewersService.addStream(e.userid, e.stream);
		}
		
		public function removeStream(e:BroadcastStoppedEvent):void {			
			_viewersService.removeStream(e.userid, e.stream);
		}
		
		public function raiseHand(e:RaiseHandEvent):void {
			var userid:Number = _participants.me.userid;
			_viewersService.raiseHand(userid, e.raised);
		}
		
		public function lowerHand(e:LowerHandEvent):void {
			if (this.isModerator()) _viewersService.raiseHand(e.userid, false);
		}
		
		public function queryPresenter():void {
//			_viewersService.queryPresenter();
		}
		
		private function connectionStatusListener(connected:Boolean, reason:String = null):void {
			if (connected) {
				// Set the module.userid, _participants.me.userid in the ViewersSOService.
				module.userid = _participants.me.userid;
				//sendNotification(ViewersModuleConstants.LOGGED_IN);
				new Dispatcher().dispatchEvent(new BBBEvent(BBBEvent.LOGIN_EVENT));
				//new Dispatcher().dispatchEvent(new BBBMessageEvent(BBBMessageEvent.MESSAGE_EVENT, "test"));
			} else {
				_participants = null;
				var connectionEvent:ConnectionFailedEvent = new ConnectionFailedEvent();
				connectionEvent.reason = ConnectionFailedEvent.UNKNOWN_REASON;
				dispatcher.dispatchEvent(connectionEvent);
			}
		}
		
		public function get connection():NetConnection
		{
			return _viewersService.connection;
		}
	}
}