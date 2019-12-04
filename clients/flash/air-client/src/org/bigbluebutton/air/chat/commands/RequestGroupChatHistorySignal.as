package org.bigbluebutton.air.chat.commands {
	import org.osflash.signals.Signal;
	
	public class RequestGroupChatHistorySignal extends Signal {
		public function RequestGroupChatHistorySignal() {
			super(String);
		}
	}
}
