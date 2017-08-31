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
package org.bigbluebutton.modules.caption.managers {
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.caption.events.GetCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveEditCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveUpdateCaptionOwnerEvent;
	import org.bigbluebutton.modules.caption.events.RequestTranscriptsEvent;
	import org.bigbluebutton.modules.caption.model.Transcripts;
	import org.bigbluebutton.modules.caption.views.CaptionWindow;

	public class CaptionManager {
//		private var _captionOptions:CaptionOptions;
		private var _captionWindow:CaptionWindow;
		private var _transcripts:Transcripts;		
		
		public function CaptionManager() {
			_captionWindow = new CaptionWindow();
			_transcripts = new Transcripts();
		}
		
		public function requestTranscripts(event:RequestTranscriptsEvent):void {
			if (event.callback != null) event.callback(_transcripts);
			
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new GetCaptionHistoryEvent(GetCaptionHistoryEvent.GET_CAPTION_HISTORY_EVENT));
		}
		
		public function receiveCaptionHistory(event:ReceiveCaptionHistoryEvent):void {
			_transcripts.receiveCaptionHistory(event.history);
		}
		
		public function receiveUpdateCaptionOwner(event:ReceiveUpdateCaptionOwnerEvent):void {
			_transcripts.updateCaptionOwner(event.locale, event.localeCode, event.ownerID);
		}
		
		public function receiveEditCaptionHistory(event:ReceiveEditCaptionHistoryEvent):void {
			_transcripts.editCaptionHistory(event.locale, event.localeCode, event.startIndex, event.endIndex, event.text);
		}
		
		public function openWindow():void {
			var dispatcher:Dispatcher = new Dispatcher();
			
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = _captionWindow;
			dispatcher.dispatchEvent(event);
		}
		
		public function closeWindow():void {
			var dispatcher:Dispatcher = new Dispatcher();
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = _captionWindow;
			dispatcher.dispatchEvent(event);
		}
	}
}