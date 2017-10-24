package org.bigbluebutton.modules.polling.views {
	import com.asfusion.mate.events.Listener;
	
	import mx.controls.Button;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.present.events.PageLoadedEvent;
	import org.bigbluebutton.modules.present.model.Page;
	import org.bigbluebutton.modules.present.model.PresentationModel;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class QuickPollButton extends Button {
		private static const LOGGER:ILogger = getClassLogger(QuickPollButton);      

		override public function set visible(vsb:Boolean):void {
			if (vsb) {
				// This button should only be visible when there is a polling at the current slide's text
//				var page:Page = PresentationModel.getInstance().getCurrentPage();
//				super.visible = page != null ? parseSlideText(page.txtData) : false;
			} else {
				super.visible = false;
			}
		}

		public function QuickPollButton() {
			super();
			visible = false;
			
			var listener:Listener = new Listener();
			listener.type = PageLoadedEvent.PAGE_LOADED_EVENT;
			listener.method = handlePageLoadedEvent;
		}
		
		private function handlePageLoadedEvent(e:PageLoadedEvent):void {
			visible = UsersUtil.amIPresenter();
		}
		
		private function parseSlideText(text:String):Boolean {
			var numRegex:RegExp = new RegExp("\n[^\s][\.\)]", "g");
			var ynRegex:RegExp = new RegExp((ResourceUtil.getInstance().getString("bbb.polling.answer.Yes")+
				"\s*/\s*"+
				ResourceUtil.getInstance().getString("bbb.polling.answer.No")).toLowerCase());
			var nyRegex:RegExp = new RegExp((ResourceUtil.getInstance().getString("bbb.polling.answer.No")+
				"\s*/\s*"+
				ResourceUtil.getInstance().getString("bbb.polling.answer.Yes")).toLowerCase());
			var tfRegex:RegExp = new RegExp((ResourceUtil.getInstance().getString("bbb.polling.answer.True")+
				"\s*/\s*"+
				ResourceUtil.getInstance().getString("bbb.polling.answer.False")).toLowerCase());
			var ftRegex:RegExp = new RegExp((ResourceUtil.getInstance().getString("bbb.polling.answer.False")+
				"\s*/\s*"+
				ResourceUtil.getInstance().getString("bbb.polling.answer.True")).toLowerCase());
			
			text = text.toLowerCase();
			
			var matchedArray:Array = text.match(numRegex);
			LOGGER.debug("Parse Result: {0} {1}", [matchedArray.length, matchedArray.join(" ")]);
			if (matchedArray.length > 1) {
				var constructedLabel:String = ResourceUtil.getInstance().getString("bbb.polling.answer."+String.fromCharCode(65));
				var len:int = matchedArray.length < 7 ? matchedArray.length : 6;
				for (var i:int=1; i<len; i++) {
					constructedLabel += "/" + ResourceUtil.getInstance().getString("bbb.polling.answer."+String.fromCharCode(65+i));
				}
				label = constructedLabel;
				name = "A-"+len;
				return true;
			} else if (text.search(ynRegex) > -1 || text.search(nyRegex) > -1) {
				label = ResourceUtil.getInstance().getString("bbb.polling.answer.Yes")+
						"/"+
						ResourceUtil.getInstance().getString("bbb.polling.answer.No");
				name = "YN";
				return true;
			} else if (text.search(tfRegex) > -1 || text.search(ftRegex) > -1) {
				label = ResourceUtil.getInstance().getString("bbb.polling.answer.True")+
					"/"+
					ResourceUtil.getInstance().getString("bbb.polling.answer.False");
				name = "TF";
				return true;
			} else {
				return false;
			}
		}
	}
}