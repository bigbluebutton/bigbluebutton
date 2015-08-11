package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class AuthenticationSignal extends Signal {
		public function AuthenticationSignal() {
			super(String);
		}
	}
}
