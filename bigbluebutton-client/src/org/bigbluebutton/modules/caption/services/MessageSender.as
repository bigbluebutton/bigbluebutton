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
	import flash.events.IEventDispatcher;
	
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
		
		public function sendNewCaptionLine(message:Object):void {  
			LOGGER.debug("Sending [caption.newCaptionLine] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.newCaptionLine", 
				function(result:String):void { // On successful result
					LOGGER.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
		
		public function deleteCaptionLine(message:Object):void {
			LOGGER.debug("Sending [caption.deleteCaptionLine] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.deleteCaptionLine", 
				function(result:String):void { // On successful result
					LOGGER.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
		
		public function correctCaptionLine(message:Object):void {
			LOGGER.debug("Sending [caption.correctCaptionLine] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.correctCaptionLine", 
				function(result:String):void { // On successful result
					LOGGER.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
		
		public function updateTranscriptionList(message:Object):void {
			LOGGER.debug("Sending [caption.updateTranscriptionList] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("caption.updateTranscriptionList", 
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