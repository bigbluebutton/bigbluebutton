package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.user.models.User2x;
	import org.osflash.signals.Signal;
	
	public class EmojiSignal extends Signal {
		/**
		 * @1 user
		 * @2 status
		 */
		public function EmojiSignal() {
			super(User2x, String);
		}
	}
}
