package org.bigbluebutton.air.main.views.disconnectpage {
	
	import spark.components.Button;
	
	public class DisconnectPageView extends DisconnectPageViewBase implements IDisconnectPageView {
		public function get exitButton():Button {
			return exitButton0;
		}
		
		public function get reconnectButton():Button {
			return reconnectButton0;
		}
	}
}
