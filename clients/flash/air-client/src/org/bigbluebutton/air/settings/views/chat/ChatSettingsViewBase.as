package org.bigbluebutton.air.settings.views.chat {
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.VGroup;
	import spark.components.supportClasses.ToggleButtonBase;
	import spark.layouts.VerticalAlign;
	import spark.primitives.Line;
	
	public class ChatSettingsViewBase extends VGroup {
		private var _title:Label;
		
		private var _audioToggle:ToggleButtonBase;
		
		private var _pushToggle:ToggleButtonBase;
		
		private var _fontSizeLabel:Label;
		
		private var _increaseFontSizeButton:Button;
		
		private var _decreaseFontSizeButton:Button;
		
		private var _microphoneSeparator:Line;
		
		private var _audioSeparator:Line;
		
		private var _containers:Array;
		
		public function get audioToggle():ToggleButtonBase {
			return _audioToggle;
		}
		
		public function get pushToggle():ToggleButtonBase {
			return _pushToggle;
		}
		
		protected function get toggleButtonClass():Class {
			return ToggleButtonBase;
		}
		
		public function ChatSettingsViewBase() {
			super();
			
			gap = 0;
			
			_containers = [];
			
			_title = new Label();
			_title.text = "Session Settings";
			_title.percentWidth = 100;
			_title.styleName = "sectionTitle";
			addElement(_title);
			
			// Mirohpone group
			var audioGroup:HGroup = new HGroup();
			audioGroup.percentWidth = 100;
			audioGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(audioGroup);
			_containers.push(audioGroup);
			
			var microphoneLabel:Label = new Label();
			microphoneLabel.text = "Audio notifications for chat";
			microphoneLabel.percentWidth = 100;
			audioGroup.addElement(microphoneLabel);
			
			_pushToggle = new toggleButtonClass();
			audioGroup.addElement(_pushToggle);
			
			_microphoneSeparator = new Line();
			_microphoneSeparator.percentWidth = 100;
			addElement(_microphoneSeparator);
			
			// Audio group
			var notificationGroup:HGroup = new HGroup();
			notificationGroup.percentWidth = 100;
			notificationGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(notificationGroup);
			_containers.push(notificationGroup);
			
			var audioLabel:Label = new Label();
			audioLabel.text = "Push notifications for chat";
			audioLabel.percentWidth = 100;
			notificationGroup.addElement(audioLabel);
			
			_audioToggle = new toggleButtonClass();
			notificationGroup.addElement(_audioToggle);
			
			_audioSeparator = new Line();
			_audioSeparator.percentWidth = 100;
			addElement(_audioSeparator);
			
			// Settings title
			var _settingsTitle:Label = new Label();
			_settingsTitle.text = "Styles";
			_settingsTitle.percentWidth = 100;
			_settingsTitle.styleName = "sectionTitle";
			addElement(_settingsTitle);
			
			// Font size group
			var fontSizeGroup:HGroup = new HGroup();
			fontSizeGroup.percentWidth = 100;
			addElement(fontSizeGroup);
			
			var fontLabel:Label = new Label();
			fontLabel.text = "Font size";
			fontSizeGroup.addElement(fontLabel);
			
			_fontSizeLabel = new Label();
			_fontSizeLabel.text = "34pt";
			_fontSizeLabel.setStyle("textAlign", "center");
			_fontSizeLabel.percentWidth = 100;
			fontSizeGroup.addElement(_fontSizeLabel);
			
			_increaseFontSizeButton = new Button();
			_increaseFontSizeButton.styleName = "icon-circle-add settingsIcon";
			fontSizeGroup.addElement(_increaseFontSizeButton);
			_containers.push(fontSizeGroup);
			
			_decreaseFontSizeButton = new Button();
			_decreaseFontSizeButton.styleName = "icon-circle-minus settingsIcon";
			fontSizeGroup.addElement(_decreaseFontSizeButton);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			for (var i:int = 0; i < _containers.length; i++) {
				_containers[i]["padding"] = getStyle("padding");
			}
			
			_microphoneSeparator.stroke = new SolidColorStroke(getStyle("separatorColor"));
			_audioSeparator.stroke = new SolidColorStroke(getStyle("separatorColor"));
		}
	}
}
