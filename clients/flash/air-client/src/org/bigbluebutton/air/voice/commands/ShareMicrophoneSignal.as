package org.bigbluebutton.air.voice.commands {
	
	import org.osflash.signals.Signal;
	
	public class ShareMicrophoneSignal extends Signal {
		public function ShareMicrophoneSignal() {
			super(int, String);
		}
	}
}
