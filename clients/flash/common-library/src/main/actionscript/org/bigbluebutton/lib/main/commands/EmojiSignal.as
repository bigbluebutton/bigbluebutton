package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class EmojiSignal extends Signal {
		public function EmojiSignal() {
			/**
			 * @1 status
			 */
			super(String);
		}
	}
}
