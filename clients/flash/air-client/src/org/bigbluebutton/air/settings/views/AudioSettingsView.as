package org.bigbluebutton.air.settings.views {
	
	import spark.components.Button;
	
	public class AudioSettingsView extends AudioSettingsViewBase implements IAudioSettingsView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get shareMicButton():Button {
			return shareMicBtn;
		}
		
		public function get listenOnlyButton():Button {
			return listenOnlyBtn;
		}
	}
}
