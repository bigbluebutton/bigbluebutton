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
	import org.bigbluebutton.core.managers.ConnectionManager;
	
	public class MessageSender {
		private static const LOGGER:ILogger = getClassLogger(MessageSender);
		
		public function getCaptionHistory():void {
			LOGGER.debug("Sending [caption.getCaptionHistory] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.getCaptionHistory", 
				function(result:String):void { // On successful result
					LOGGER.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				}
			);
		}
		
		public function sendUpdateCaptionOwner(message:Object):void {
			LOGGER.debug("Sending [caption.sendUpdateCaptionOwner] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.sendUpdateCaptionOwner", 
				function(result:String):void { // On successful result
					LOGGER.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
		
		public function sendEditCaptionHistory(message:Object):void {  
			LOGGER.debug("Sending [caption.editCaptionHistory] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.editCaptionHistory", 
				function(result:String):void { // On successful result
					LOGGER.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
	}
}