package org.bigbluebutton.air.presentation.commands {
	
	import org.bigbluebutton.air.presentation.models.Slide;
	import org.osflash.signals.Signal;
	
	public class LoadSlideSignal extends Signal {
		public function LoadSlideSignal() {
			super(Slide, String);
		}
	}
}
