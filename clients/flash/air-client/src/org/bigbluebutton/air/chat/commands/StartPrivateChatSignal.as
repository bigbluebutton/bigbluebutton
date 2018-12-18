package org.bigbluebutton.air.chat.commands {
	import org.osflash.signals.Signal;
	
	public class StartPrivateChatSignal extends Signal {
		public function StartPrivateChatSignal() {
			super(String);
		}
	}
}
