package org.bigbluebutton.web.presentation.views {
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	import org.osflash.signals.Signal;
	
	public interface IPresentationWindow extends IPresentationView {
		function get resizeWindowSignal():Signal;
	}
}
