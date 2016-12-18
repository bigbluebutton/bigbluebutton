package org.bigbluebutton.lib.settings.views.audio {
	import spark.components.HGroup;
	import spark.components.HSlider;
	import spark.components.Label;
	import spark.components.VGroup;
	import spark.components.supportClasses.ToggleButtonBase;
	import spark.layouts.VerticalAlign;
	
	public class AudioSettingsViewBase extends VGroup {
		
		private var _audioToggle:ToggleButtonBase;
		
		private var _microhponeToggle:ToggleButtonBase;
		
		private var _gainSlider:HSlider;
		
		public function get audioToggle():ToggleButtonBase {
			return _audioToggle;
		}
		
		public function get microhponeToggle():ToggleButtonBase {
			return _microhponeToggle;
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
			
			// Mirohpone group
			var microphoneGroup:HGroup = new HGroup();
			microphoneGroup.percentWidth = 100;
			microphoneGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(microphoneGroup);
			
			var microphoneLabel:Label = new Label();
			microphoneLabel.text = "Enable mirohpone";
			microphoneLabel.percentWidth = 100;
			microphoneGroup.addElement(microphoneLabel);
			
			_microhponeToggle = new toggleButtonClass();
			microphoneGroup.addElement(_microhponeToggle);
			
			// Gain group
			var gainGroup:VGroup = new VGroup();
			gainGroup.percentWidth = 100;
			gainGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(gainGroup);
			
			var gainLabel:Label = new Label();
			gainLabel.text = "Mirohpone level";
			gainGroup.addElement(gainLabel);
			
			// Gain sub-group
			var gainSliderGroup:HGroup = new HGroup();
			gainSliderGroup.percentWidth = 100;
			gainGroup.addElement(gainSliderGroup);
			
			var micEmptyLabel:Label = new Label();
			micEmptyLabel.styleName = "settingsIcon icon-audio";
			gainSliderGroup.addElement(micEmptyLabel);
			
			_gainSlider = new HSlider();
			_gainSlider.percentWidth = 100;
			gainSliderGroup.addElement(_gainSlider);
			
			var micFullLabel:Label = new Label();
			micFullLabel.styleName = "settingsIcon icon-audio";
			gainSliderGroup.addElement(micFullLabel);
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			_audioToggle.parent["padding"] = getStyle("padding");
			_microhponeToggle.parent["padding"] = getStyle("padding");
			_gainSlider.parent["padding"] = getStyle("padding") * 0.5;
			_gainSlider.parent.parent["padding"] = getStyle("padding");
		}
	}
}
