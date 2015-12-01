package org.bigbluebutton.air.main.views.loginpage {
	
	import flash.events.MouseEvent;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	import spark.components.Button;
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
		
		public function get tryAgainButton():Button {
			return tryAgainButton0;
		}
	}
}
