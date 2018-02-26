package org.bigbluebutton.lib.settings.views.audio {
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.HSlider;
	import spark.components.Label;
	import spark.components.VGroup;
	import spark.components.supportClasses.ToggleButtonBase;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	import spark.primitives.Line;
	
	public class AudioSettingsViewBase extends VGroup {
		
		private var _audioToggle:ToggleButtonBase;
		
		private var _microphoneToggle:ToggleButtonBase;
		
		private var _gainSlider:HSlider;
		
		private var _audioSeparator:Line;
		
		private var _microphoneSeparator:Line;
		
		public function get audioToggle():ToggleButtonBase {
			return _audioToggle;
		}
		
		public function get microphoneToggle():ToggleButtonBase {
			return _microphoneToggle;
		}
		
		public function get gainSlider():HSlider {
			return _gainSlider;
		}
		
		protected function get toggleButtonClass():Class {
			return ToggleButtonBase;
		}
		
		public function AudioSettingsViewBase() {
			super();
			
			// Audio group
			var audioGroup:HGroup = new HGroup();
			audioGroup.percentWidth = 100;
			audioGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(audioGroup);
			
			var audioLabel:Label = new Label();
			audioLabel.text = "Enable audio";
			audioLabel.percentWidth = 100;
			audioGroup.addElement(audioLabel);
			
			_audioToggle = new toggleButtonClass();
			audioGroup.addElement(_audioToggle);
			
			_audioSeparator = new Line();
			_audioSeparator.percentWidth = 100;
			addElement(_audioSeparator);
			
			// Mirohpone group
			var microphoneGroup:HGroup = new HGroup();
			microphoneGroup.percentWidth = 100;
			microphoneGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(microphoneGroup);
			
			var microphoneLabel:Label = new Label();
			microphoneLabel.text = "Enable microphone";
			microphoneLabel.percentWidth = 100;
			microphoneGroup.addElement(microphoneLabel);
			
			_microphoneToggle = new toggleButtonClass();
			microphoneGroup.addElement(_microphoneToggle);
			
			_microphoneSeparator = new Line();
			_microphoneSeparator.percentWidth = 100;
			addElement(_microphoneSeparator);
			
			// Gain group
			var gainGroup:VGroup = new VGroup();
			gainGroup.percentWidth = 100;
			gainGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(gainGroup);
			
			var gainLabel:Label = new Label();
			gainLabel.text = "Microphone level";
			gainGroup.addElement(gainLabel);
			
			// Gain sub-group
			var gainSliderGroup:HGroup = new HGroup();
			gainSliderGroup.percentWidth = 100;
			gainGroup.addElement(gainSliderGroup);
			
			var emptyMicGroup:VGroup = new VGroup();
			emptyMicGroup.horizontalAlign = HorizontalAlign.CENTER;
			gainSliderGroup.addElement(emptyMicGroup);
			
			var micEmptyLabel:Button = new Button();
			micEmptyLabel.styleName = "icon-unmute settingsIcon";
			emptyMicGroup.addElement(micEmptyLabel);
			
			var emptyMicLabel:Label = new Label();
			emptyMicLabel.text = "Low";
			emptyMicGroup.addElement(emptyMicLabel);
			
			_gainSlider = new HSlider();
			_gainSlider.percentWidth = 100;
			_gainSlider.maximum = 100;
			_gainSlider.snapInterval = 1;
			_gainSlider.value = 60;
			gainSliderGroup.addElement(_gainSlider);
			
			var fullMicGroup:VGroup = new VGroup();
			fullMicGroup.horizontalAlign = HorizontalAlign.CENTER;
			gainSliderGroup.addElement(fullMicGroup);
			
			var micFullLabel:Button = new Button();
			micFullLabel.styleName = "icon-unmute settingsIcon";
			fullMicGroup.addElement(micFullLabel);
			
			var fullMicLabel:Label = new Label();
			fullMicLabel.text = "High";
			fullMicGroup.addElement(fullMicLabel);
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			_audioToggle.parent["padding"] = getStyle("padding");
			_microphoneToggle.parent["padding"] = getStyle("padding");
			_gainSlider.parent["padding"] = getStyle("padding") * 0.5;
			_gainSlider.parent.parent["padding"] = getStyle("padding");
			
			_audioSeparator.stroke = new SolidColorStroke(getStyle("separatorColor"));
			_microphoneSeparator.stroke = new SolidColorStroke(getStyle("separatorColor"));
		}
	}
}
