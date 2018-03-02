package org.bigbluebutton.lib.presentation.commands {
	
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.osflash.signals.Signal;
	
	public class LoadSlideSignal extends Signal {
		public function LoadSlideSignal() {
			super(Slide, String);
		}
	}
}
