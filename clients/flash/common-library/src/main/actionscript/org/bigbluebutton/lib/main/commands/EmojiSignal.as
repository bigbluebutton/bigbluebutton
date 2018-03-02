package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class EmojiSignal extends Signal {
		public function EmojiSignal() {
			/**
			 * @1 userId
			 * @2 status
			 */
			super(String, String);
		}
	}
}
