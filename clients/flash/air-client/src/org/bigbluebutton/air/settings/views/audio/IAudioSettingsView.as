package org.bigbluebutton.air.settings.views.audio {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.HSlider;
	import spark.components.ToggleSwitch;
	import spark.primitives.Rect;
	
	public interface IAudioSettingsView extends IView {
		function get enableMic():ToggleSwitch;
		function get enableAudio():ToggleSwitch;
		function get enablePushToTalk():ToggleSwitch;
		function get continueBtn():Button;
		function get gainSlider():HSlider;
		function get micActivityMask():Rect;
		function get micActivity():Rect;
	}
}
