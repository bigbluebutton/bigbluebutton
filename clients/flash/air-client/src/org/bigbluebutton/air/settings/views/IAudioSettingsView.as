package org.bigbluebutton.air.settings.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	
	public interface IAudioSettingsView extends IView {
		function get shareMicButton():Button;
		function get listenOnlyButton():Button;
	}
}
