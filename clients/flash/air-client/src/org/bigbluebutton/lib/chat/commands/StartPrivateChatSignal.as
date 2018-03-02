package org.bigbluebutton.lib.chat.commands {
	import org.osflash.signals.Signal;
	
	public class StartPrivateChatSignal extends Signal {
		public function StartPrivateChatSignal() {
			super(String);
		}
	}
}
