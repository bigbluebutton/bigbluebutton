package org.bigbluebutton.air.main.commands {
	import org.osflash.signals.Signal;
	
	public class MuteAllUsersExpectPresenterSignal extends Signal {
		public function MuteAllUsersExpectPresenterSignal() {
			/**
			 * @1 mute
			 */
			super(Boolean);
		}
	}
}
