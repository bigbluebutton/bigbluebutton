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
package org.bigbluebutton.modules.caption.services {
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ConnectionManager;
	
	public class MessageSender {
		private static const LOGGER:ILogger = getClassLogger(MessageSender);
		
		public function getCaptionHistory():void {
			var message:Object = {
				header: {name: "SendCaptionHistoryReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {}
			};
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(
				function(result:String):void { // On successful result
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status);
				},
				message
			);
		}
		
		public function sendUpdateCaptionOwner(locale: String, localeCode: String):void {
			var message:Object = {
				header: {name: "UpdateCaptionOwnerPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {locale: locale, localeCode: localeCode, ownerId: UsersUtil.getMyUserID()}
			};
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(
				function(result:String):void { // On successful result
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status);
				},
				message
			);
		}
		
		public function sendEditCaptionHistory(startIndex: int, endIndex: int, locale: String, localeCode: String, text: String):void {
			var message:Object = {
				header: {name: "EditCaptionHistoryPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {startIndex: startIndex, endIndex: endIndex, locale: locale, localeCode: localeCode, text: text}
			};
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(
				function(result:String):void { // On successful result
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status);
				},
				message
			);
		}
	}
}