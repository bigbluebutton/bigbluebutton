package org.bigbluebutton.lib.whiteboard.commands {
	import org.osflash.signals.Signal;
	
	public class GetWhiteboardHistorySignal extends Signal {
		public function GetWhiteboardHistorySignal() {
			super(String);
		}
	}
}
