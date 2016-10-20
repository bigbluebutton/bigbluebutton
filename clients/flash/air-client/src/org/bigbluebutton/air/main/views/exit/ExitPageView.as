package org.bigbluebutton.air.main.views.exit {
	
	import spark.components.Button;
	
	public class ExitPageView extends ExitPageViewBase implements IExitPageView {
		public function get yesButton():Button {
			return yesButton0;
		}
		
		public function get noButton():Button {
			return noButton0;
		}
	}
}
