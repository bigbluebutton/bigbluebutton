package org.bigbluebutton.air.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class NavigateToSignal extends Signal {
		public function NavigateToSignal() {
			super(String, Object, int);
		}
	}
}
