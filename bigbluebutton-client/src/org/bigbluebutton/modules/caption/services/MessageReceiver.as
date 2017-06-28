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
	
	import mx.collections.ArrayCollection;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.caption.events.ReceiveCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveEditCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveUpdateCaptionOwnerEvent;
	import org.bigbluebutton.modules.caption.model.Transcript;
	
	public class MessageReceiver implements IMessageListener {
		private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
		
		private var dispatcher:Dispatcher = new Dispatcher();
		
		public function MessageReceiver() {
			BBB.initConnectionManager().addMessageListener(this);
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "SendCaptionHistoryRespMsg":
					handleSendCaptionHistoryRespMsg(message);
					break;
				case "UpdateCaptionOwnerEvtMsg":
					handleUpdateCaptionOwnerEvtMsg(message);
					break;
				case "EditCaptionHistoryEvtMsg":
					handleEditCaptionHistoryEvtMsg(message);
					break;
				default:
			}
		}
		
		private function handleSendCaptionHistoryRespMsg(message:Object):void {
			//LOGGER.debug("sendCaptionHistoryReply " + message.msg);
			
			var event:ReceiveCaptionHistoryEvent = new ReceiveCaptionHistoryEvent(ReceiveCaptionHistoryEvent.RECEIVE_CAPTION_HISTORY_EVENT);
			event.history = processHistoryObject(message.body.history);
			dispatcher.dispatchEvent(event);
		}
		
		private function processHistoryObject(history:Object):ArrayCollection {
			var cleanedArray:ArrayCollection = new ArrayCollection();
			
			for (var locale:String in history) {
				var transcriptData:Object = history[locale];
				var newTranscript:Transcript = new Transcript(locale, transcriptData.localeCode);
				newTranscript.ownerID = transcriptData.ownerId;
				newTranscript.transcript = transcriptData.text;
				cleanedArray.addItem(newTranscript);
			}
			
			return cleanedArray;
		}
		
		private function handleUpdateCaptionOwnerEvtMsg(message:Object):void {
			//LOGGER.debug("updateCaptionOwner " + message);
			//var map:Object = JSON.parse(message);
			
			var event:ReceiveUpdateCaptionOwnerEvent = new ReceiveUpdateCaptionOwnerEvent(ReceiveUpdateCaptionOwnerEvent.RECEIVE_UPDATE_CAPTION_OWNER_EVENT);
			event.locale = message.body.locale;
			event.localeCode = message.body.localeCode;
			event.ownerID = message.body.ownerId;
			dispatcher.dispatchEvent(event);
		}
		
		private function handleEditCaptionHistoryEvtMsg(message:Object):void {
			//LOGGER.debug("editCaptionHistory {start_index:" + message.start_index+",end_index:"+message.end_index+",locale:"+message.locale+",locale_code"+message.locale_code+",text:'"+message.text+"'}");
			//var map:Object = JSON.parse(message);
			
			var event:ReceiveEditCaptionHistoryEvent = new ReceiveEditCaptionHistoryEvent(ReceiveEditCaptionHistoryEvent.RECEIVE_EDIT_CAPTION_HISTORY);
			event.startIndex = int(message.body.startIndex);
			event.endIndex = int(message.body.endIndex);
			event.locale = message.body.locale;
			event.localeCode = message.body.localeCode;
			event.text = message.body.text;
			dispatcher.dispatchEvent(event);
		}
	}
}