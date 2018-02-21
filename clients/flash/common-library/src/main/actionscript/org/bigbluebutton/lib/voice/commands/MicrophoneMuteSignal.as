package org.bigbluebutton.lib.voice.commands {
	
	import org.bigbluebutton.lib.user.models.User2x;
	import org.osflash.signals.Signal;
	
	public class MicrophoneMuteSignal extends Signal {
		public function MicrophoneMuteSignal() {
			/**
			 * @1 microphone enabled
			 */
			super(User2x);
		}
	}
}
