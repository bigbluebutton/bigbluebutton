package org.bigbluebutton.modules.polling.views {
	import com.asfusion.mate.events.Listener;
	
	import mx.controls.Button;
	
	import org.bigbluebutton.modules.present.events.PageLoadedEvent;
	import org.bigbluebutton.modules.present.model.Page;
	import org.bigbluebutton.modules.present.model.PresentationModel;
	
	public class QuickPollButton extends Button {
		public function QuickPollButton() {
			super();
			visible = false;
			
			var listener:Listener = new Listener();
			listener.type = PageLoadedEvent.PAGE_LOADED_EVENT;
			listener.method = handlePageLoadedEvent;
		}
		
		private function handlePageLoadedEvent(e:PageLoadedEvent):void {
			var page:Page = PresentationModel.getInstance().getPage(e.pageId);
			if (page != null) {
				parseSlideText(page.txtData);
			}
		}
		
		private function parseSlideText(text:String):void {
			var regEx:RegExp = new RegExp("\n[^\s]+[\.\)]", "g");
			var matchedArray:Array = text.match(regEx);
			trace("Parse Result: " + matchedArray.length + " " + matchedArray.join(" "));
			if (matchedArray.length > 2) {
				label = "A-" + (matchedArray.length < 8 ? matchedArray.length : 7);
				visible = true;
			} else {
				visible = false;
			}
		}
	}
}