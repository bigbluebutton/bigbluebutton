package org.bigbluebutton.air.main.views.loginpage {
	
	import spark.components.Button;
	import spark.components.Label;
	
	public class LoginPageView extends LoginPageViewBase implements ILoginPageView {
		public function dispose():void {
		}
		
		public function get messageText():Label {
			return messageText0;
		}
		
		public function get tryAgainButton():Button {
			return tryAgainButton0;
		}
	}
}
