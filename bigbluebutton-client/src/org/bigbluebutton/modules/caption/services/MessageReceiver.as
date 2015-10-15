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
	
	import org.as3commons.lang.HashArray;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.caption.events.ReceiveCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveNewCaptionLineEvent;
	
	public class MessageReceiver implements IMessageListener {
		private static const LOG:String = "Caption::MessageReceiver - ";
		
		public function MessageReceiver() {
			BBB.initConnectionManager().addMessageListener(this);
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "sendCaptionHistoryReply":
					sendCaptionHistoryReply(message);
					break;
				case "newCaptionLine":
					newCaptionLine(message);
					break;
				case "deleteCaptionLine":
					deleteCaptionLine(message);
					break;
				case "correctCaptionLine":
					correctCaptionLine(message);
					break;
				case "updateTranscriptionList":
					updateTranscriptionList(message);
					break;
				default:
			}
		}
		
		private function sendCaptionHistoryReply(message:Object):void {
			trace(LOG + "*** getCaptionHistoryReply " + message.msg + " ****");
			var map:Object = JSON.parse(message.msg);
			
			var event:ReceiveCaptionHistoryEvent = new ReceiveCaptionHistoryEvent(ReceiveCaptionHistoryEvent.RECEIVE_CAPTION_HISTORY_EVENT);
			event.history = map;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
		}
		
		private function newCaptionLine(message:Object):void {
			trace(LOG + "*** newCaptionLine " + message + " ****");
			//var map:Object = JSON.parse(message);
			
			var event:ReceiveNewCaptionLineEvent = new ReceiveNewCaptionLineEvent(ReceiveNewCaptionLineEvent.RECEIVE_NEW_CAPTION_LINE);
			event.locale = message.locale;
			event.lineNumber = message.line_number;
			event.text = message.text;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
		}
		
		private function deleteCaptionLine(message:Object):void {
			trace(LOG + "*** deleteCaptionLine " + message.msg + " ****");
			var map:Object = JSON.parse(message.msg);
			
		}
		
		private function correctCaptionLine(message:Object):void {
			trace(LOG + "*** correctCaptionLine " + message.msg + " ****");
			var map:Object = JSON.parse(message.msg);
			
		}
		
		private function updateTranscriptionList(message:Object):void {
			trace(LOG + "*** updateTranscriptionList " + message.msg + " ****");
			var map:Object = JSON.parse(message.msg);
			
		}
	}
}