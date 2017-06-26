package org.bigbluebutton.modules.present.services.messages {
	public class PageChangeVO {
		public var presentationId:String;
		public var pageId:String;
		
		public function PageChangeVO(presentationId:String, pageId:String) {
			this.presentationId = presentationId;
			this.pageId = pageId;
		}
	}
}