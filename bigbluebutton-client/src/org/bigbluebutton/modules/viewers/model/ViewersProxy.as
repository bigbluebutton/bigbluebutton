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
package org.bigbluebutton.modules.viewers.model
{
	import flash.net.NetConnection;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.bigbluebutton.modules.viewers.model.business.IViewers;
	import org.bigbluebutton.modules.viewers.model.services.IViewersService;
	import org.bigbluebutton.modules.viewers.model.services.JoinService;
	import org.bigbluebutton.modules.viewers.model.services.ViewersSOService;
	import org.bigbluebutton.modules.viewers.model.vo.Status;
	import org.bigbluebutton.modules.viewers.model.vo.User;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ViewersProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ViewersProxy";
		private var module:ViewersModule;		
		private var _viewersService:IViewersService;
		private var _participants:IViewers = null;
		private var joinService:JoinService;
		
		private var isPresenter:Boolean = false;
				
		public function ViewersProxy(module:ViewersModule)
		{
			super(NAME);
			this.module = module;
		}
		
		override public function getProxyName():String
		{
			return NAME;
		}
		
		public function connect():void {
			_viewersService = new ViewersSOService(module, _participants);
			_viewersService.addConnectionStatusListener(connectionStatusListener);
			_viewersService.addMessageSender(messageSender);
			LogUtil.debug(NAME + '::' + module.username + "," + module.role);
			_viewersService.connect(module.username, module.role, module.conference, module.mode, module.room);		
		}

		public function join():void {
			LogUtil.debug(NAME + "::joning in ");
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
				module.voicebridge = result.voicebridge;
				module.conferenceName = result.conferenceName;
				module.welcome = result.welcome;
				
				if (result.record == 'true') {
					module.record = true;
				} else {
					module.record = false;
				}
				
				connect();
			} else {
				LogUtil.debug(NAME + '::Sending ViewersModuleConstants.JOIN_FAILED');
				sendNotification(ViewersModuleConstants.JOIN_FAILED, result);
			}
		}
		
		public function stop():void {
			_viewersService.disconnect();
		}
		
		public function get me():User {
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
		
		public function addStream(userid:Number, streamName:String):void {
			_viewersService.addStream(userid, streamName);
		}
		
		public function removeStream(userid:Number, streamName:String):void {			
			_viewersService.removeStream(userid, streamName);
		}
		
		public function raiseHand(raise:Boolean):void {
			var userid:Number = _participants.me.userid;
			_viewersService.raiseHand(userid, raise);
		}
		
		public function lowerHand(userid:Number):void {
			_viewersService.raiseHand(userid, false);
		}
		
		public function queryPresenter():void {
//			_viewersService.queryPresenter();
		}
		
		private function connectionStatusListener(connected:Boolean, reason:String = null):void {
			if (connected) {
				// Set the module.userid, _participants.me.userid in the ViewersSOService.
				module.userid = _participants.me.userid;
				sendNotification(ViewersModuleConstants.LOGGED_IN);
			} else {
				_participants = null;
				if (reason == null) reason = ViewersModuleConstants.UNKNOWN_REASON;
				sendNotification(ViewersModuleConstants.LOGGED_OUT, reason);
			}
		}
		
		private function messageSender(msg:String, body:Object=null):void {
			switch (msg) {
				case ViewersModuleConstants.ASSIGN_PRESENTER:
					LogUtil.debug('Got ViewersModuleConstants.ASSIGN_PRESENTER ' + me.userid + " " + body.assignedTo);
					if (me.userid == body.assignTo) {
						// I've been assigned as presenter.
						LogUtil.debug('I have become presenter');
						isPresenter = true;
						var newStatus:Status = new Status("presenter", body.assignedBy);
						sendNotification(msg, body);
					} else {
						// Somebody else has become presenter.
						if (isPresenter) {
							LogUtil.debug('Somebody else has become presenter.');
//							_viewersService.iAmPresenter(me.userid, false);
						}
						isPresenter = false;
						sendNotification(ViewersModuleConstants.BECOME_VIEWER, body);					
					}
					break;
				default:
					sendNotification(msg, body);
			} 
		}		
		
		public function get connection():NetConnection
		{
			return _viewersService.connection;
		}
	}
}