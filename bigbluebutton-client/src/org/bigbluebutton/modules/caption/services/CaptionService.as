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
	import org.bigbluebutton.modules.caption.events.SendEditCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.SendUpdateCaptionOwnerEvent;

	public class CaptionService {
		public var sender:MessageSender;
		public var receiver:MessageReceiver;
		
		public function CaptionService() {
			sender = new MessageSender();
			receiver = new MessageReceiver();
		}
		
		public function getCaptionHistory():void {
			sender.getCaptionHistory();
		}
		
		public function sendUpdateCaptionOwner(e:SendUpdateCaptionOwnerEvent):void {
			var msg:Object = new Object();
			msg.locale = e.locale;
			msg.localeCode = e.localeCode;
			msg.claim = e.claim;
			
			sender.sendUpdateCaptionOwner(msg);
		}
		
		public function sendEditCaptionHistory(e:SendEditCaptionHistoryEvent):void {
			if (e.startIndex >= 0) {
				var msg:Object = new Object();
				msg.startIndex = e.startIndex;
				msg.endIndex = e.endIndex;
				msg.locale = e.locale;
				msg.localeCode = e.localeCode;
				msg.text = e.text;
				
				sender.sendEditCaptionHistory(msg);
			}
		}
	}
}