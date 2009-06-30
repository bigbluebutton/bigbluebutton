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
package org.bigbluebutton.modules.viewers.model.services
{
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.viewers.model.vo.Status;
	
	public interface IViewersService
	{
		function connect(username:String, role:String, conference:String, mode:String, room:String):void;
		function disconnect():void;
		function addConnectionStatusListener(connectionListener:Function):void;	
//		function iAmPresenter(userid:Number, presenter:Boolean):void;
//		function newStatus(userid:Number, newStatus:Status):void;
//		function changeStatus(userid:Number, newStatus:Status):void;
//		function removeStatus(userid:Number, statusName:String):void;
		function raiseHand(userid:Number, raise:Boolean):void;
		function addStream(userid:Number, streamName:String):void;
		function removeStream(userid:Number, streamName:String):void;
		function addMessageSender(msgSender:Function):void;
		function assignPresenter(userid:Number, assignedBy:Number):void; 
//		function queryPresenter():void;	
		
		function get connection():NetConnection;
	}
}