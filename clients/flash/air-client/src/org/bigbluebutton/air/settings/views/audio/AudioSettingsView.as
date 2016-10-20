package org.bigbluebutton.air.settings.views.audio {
	
	import spark.components.Button;
	import spark.components.HSlider;
	import spark.components.ToggleSwitch;
	import spark.primitives.Rect;
	
	public class AudioSettingsView extends AudioSettingsViewBase implements IAudioSettingsView {
		
		public function dispose():void {
		}
		
		public function get enableMic():ToggleSwitch {
			return enableMic0;
		}
		
		public function get enableAudio():ToggleSwitch {
			return enableAudio0;
		}
		
		public function get enablePushToTalk():ToggleSwitch {
			return enablePushToTalk0;
		}
		
		public function get continueBtn():Button {
			return continueToMeeting;
		}
		
		public function get gainSlider():HSlider {
			return gainSlider0;
		}
		
		public function get micActivity():Rect {
			return micActivity0;
		}
		
		public function get micActivityMask():Rect {
			return micActivityMask0;
		}
	}
}
