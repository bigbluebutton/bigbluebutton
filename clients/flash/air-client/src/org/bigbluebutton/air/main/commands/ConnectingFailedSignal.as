package org.bigbluebutton.air.main.commands {
	import org.osflash.signals.Signal;
	
	public class ConnectingFailedSignal extends Signal {
		public function ConnectingFailedSignal() {
			super(String);
		}
	}
}
