package org.bigbluebutton.air.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class JoinMeetingSignal extends Signal {
		public function JoinMeetingSignal() {
			super(String);
		}
	}
}
