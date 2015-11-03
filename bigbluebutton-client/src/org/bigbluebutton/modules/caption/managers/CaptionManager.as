package org.bigbluebutton.modules.caption.managers {
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.caption.events.GetCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveCurrentCaptionLineEvent;
	import org.bigbluebutton.modules.caption.events.ReceiveNewCaptionLineEvent;
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
		
//		private function getCaptionOptions():void {
//			if (_captionOptions == null) captionOptions = new CaptionOptions();
//			return _captionOptions;
//		}
		
		public function requestTranscripts(event:RequestTranscriptsEvent):void {
			if (event.callback != null) event.callback(_transcripts);
			
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new GetCaptionHistoryEvent(GetCaptionHistoryEvent.GET_CAPTION_HISTORY_EVENT));
		}
		
		public function receiveCaptionHistory(event:ReceiveCaptionHistoryEvent):void {
			_transcripts.receiveCaptionHistory(event.history);
		}
		
		public function receiveNewCaptionLine(event:ReceiveNewCaptionLineEvent):void {
			_transcripts.newCaptionLine(event.locale, event.lineNumber, event.text);
		}
		
		public function receiveCurrentCaptionLine(event:ReceiveCurrentCaptionLineEvent):void {
			_transcripts.updateCurrentCaptionLine(event.locale, event.text);
		}
		
		public function openWindow():void {
			var dispatcher:Dispatcher = new Dispatcher();
			
//			getCaptionOptions();
//			_captionWindow.captionOptions = _captionOptions;
			
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