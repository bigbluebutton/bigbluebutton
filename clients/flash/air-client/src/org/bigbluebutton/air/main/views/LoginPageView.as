package org.bigbluebutton.air.main.views {
	
	import spark.components.Label;
	
	public class LoginPageView extends LoginPageViewBase implements ILoginPageView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get messageText():Label {
			return messageText0;
		}
	}
}
