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
	import com.asfusion.mate.events.Dispatcher;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.caption.events.ReceiveCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveEditCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveUpdateCaptionOwnerEvent;
	
	public class MessageReceiver implements IMessageListener {
		private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
		
		public function MessageReceiver() {
			BBB.initConnectionManager().addMessageListener(this);
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "sendCaptionHistoryReply":
					sendCaptionHistoryReply(message);
					break;
				case "updateCaptionOwner":
					updateCaptionOwner(message);
					break;
				case "editCaptionHistory":
					editCaptionHistory(message);
					break;
				default:
			}
		}
		
		private function sendCaptionHistoryReply(message:Object):void {
			//LOGGER.debug("sendCaptionHistoryReply " + message.msg);
			var map:Object = JSON.parse(message.msg);
			
			var event:ReceiveCaptionHistoryEvent = new ReceiveCaptionHistoryEvent(ReceiveCaptionHistoryEvent.RECEIVE_CAPTION_HISTORY_EVENT);
			event.history = map;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
		}
		
		private function updateCaptionOwner(message:Object):void {
			//LOGGER.debug("updateCaptionOwner " + message);
			//var map:Object = JSON.parse(message);
			
			var event:ReceiveUpdateCaptionOwnerEvent = new ReceiveUpdateCaptionOwnerEvent(ReceiveUpdateCaptionOwnerEvent.RECEIVE_UPDATE_CAPTION_OWNER_EVENT);
			event.locale = message.locale;
			event.localeCode = message.localeCode;
			event.ownerID = message.owner_id;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
		}
		
		private function editCaptionHistory(message:Object):void {
			//LOGGER.debug("editCaptionHistory {start_index:" + message.start_index+",end_index:"+message.end_index+",locale:"+message.locale+",locale_code"+message.locale_code+",text:'"+message.text+"'}");
			//var map:Object = JSON.parse(message);
			
			var event:ReceiveEditCaptionHistoryEvent = new ReceiveEditCaptionHistoryEvent(ReceiveEditCaptionHistoryEvent.RECEIVE_EDIT_CAPTION_HISTORY);
			event.startIndex = int(message.start_index);
			event.endIndex = int(message.end_index);
			event.locale = message.locale;
			event.localeCode = message.locale_code;
			event.text = message.text;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
		}
	}
}