package org.bigbluebutton.air.main.commands {
	import org.osflash.signals.Signal;
	
	public class MuteAllUsersSignal extends Signal {
		public function MuteAllUsersSignal() {
			/**
			 * @1 mute
			 */
			super(Boolean);
		}
	}
}
