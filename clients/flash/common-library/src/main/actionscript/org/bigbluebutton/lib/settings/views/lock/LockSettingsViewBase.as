package org.bigbluebutton.lib.settings.views.lock {
	import spark.components.CheckBox;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.VGroup;
	import spark.components.supportClasses.ToggleButtonBase;
	import spark.layouts.VerticalAlign;
	
	public class LockSettingsViewBase extends VGroup {
		
		private var _muteToggle:ToggleButtonBase;
		
		private var _lockToggle:ToggleButtonBase;
		
		private var _webcamCheckbox:CheckBox;
		
		private var _microphoneCheckbox:CheckBox;
		
		private var _publicChatCheckbox:CheckBox;
		
		private var _privateChatCheckbox:CheckBox;
		
		private var _layoutCheckbox:CheckBox;
		
		public function get webcamCheckbox():CheckBox {
			return _webcamCheckbox;
		}
		
		public function get microphoneCheckbox():CheckBox {
			return _microphoneCheckbox;
		}
		
		public function get publicChatCheckbox():CheckBox {
			return _publicChatCheckbox;
		}
		
		public function get privateChatCheckbox():CheckBox {
			return _privateChatCheckbox;
		}
		
		public function get layoutCheckbox():CheckBox {
			return _layoutCheckbox;
		}
		
		protected function get toggleButtonClass():Class {
			return ToggleButtonBase;
		}
		
		public function LockSettingsViewBase() {
			super();
			
			// Audio title
			var _audioTitle:Label = new Label();
			_audioTitle.text = "Audio Control";
			_audioTitle.percentWidth = 100;
			_audioTitle.styleName = "sectionTitle";
			addElement(_audioTitle);
			
			// Mute group
			var muteGroup:HGroup = new HGroup();
			muteGroup.percentWidth = 100;
			muteGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(muteGroup);
			
			var muteLabel:Label = new Label();
			muteLabel.text = "Mute all expect the presenter";
			muteLabel.percentWidth = 100;
			muteGroup.addElement(muteLabel);
			
			_muteToggle = new toggleButtonClass();
			muteGroup.addElement(_muteToggle);
			
			// Control title
			var _lockTitle:Label = new Label();
			_lockTitle.text = "Participation Control";
			_lockTitle.percentWidth = 100;
			_lockTitle.styleName = "sectionTitle";
			addElement(_lockTitle);
			
			// Lock group
			var lockGroup:HGroup = new HGroup();
			lockGroup.percentWidth = 100;
			lockGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(lockGroup);
			
			var lockLabel:Label = new Label();
			lockLabel.text = "Lock all participants";
			lockLabel.percentWidth = 100;
			lockGroup.addElement(lockLabel);
			
			_lockToggle = new toggleButtonClass();
			lockGroup.addElement(_lockToggle);
			
			// Webcam group
			var webcamGroup:HGroup = new HGroup();
			webcamGroup.percentWidth = 100;
			webcamGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(webcamGroup);
			
			var webcamLabel:Label = new Label();
			webcamLabel.text = "Webcam";
			webcamLabel.percentWidth = 100;
			webcamGroup.addElement(webcamLabel);
			
			_webcamCheckbox = new CheckBox();
			webcamGroup.addElement(_webcamCheckbox);
			
			// Microphone group
			var microphoneGroup:HGroup = new HGroup();
			microphoneGroup.percentWidth = 100;
			microphoneGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(microphoneGroup);
			
			var microphoneLabel:Label = new Label();
			microphoneLabel.text = "Microphone";
			microphoneLabel.percentWidth = 100;
			microphoneGroup.addElement(microphoneLabel);
			
			_microphoneCheckbox = new CheckBox();
			microphoneGroup.addElement(_microphoneCheckbox);
			
			// Public chat group
			var publicChatGroup:HGroup = new HGroup();
			publicChatGroup.percentWidth = 100;
			publicChatGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(publicChatGroup);
			
			var publicChatLabel:Label = new Label();
			publicChatLabel.text = "Public chat";
			publicChatLabel.percentWidth = 100;
			publicChatGroup.addElement(publicChatLabel);
			
			_publicChatCheckbox = new CheckBox();
			publicChatGroup.addElement(_publicChatCheckbox);
			
			// Private chat group
			var privateChatGroup:HGroup = new HGroup();
			privateChatGroup.percentWidth = 100;
			privateChatGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(privateChatGroup);
			
			var privateChatLabel:Label = new Label();
			privateChatLabel.text = "Private chat";
			privateChatLabel.percentWidth = 100;
			privateChatGroup.addElement(privateChatLabel);
			
			_privateChatCheckbox = new CheckBox();
			privateChatGroup.addElement(_privateChatCheckbox);
			
			// Layout group
			var layoutGroup:HGroup = new HGroup();
			layoutGroup.percentWidth = 100;
			layoutGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(layoutGroup);
			
			var layoutLabel:Label = new Label();
			layoutLabel.text = "Layout";
			layoutLabel.percentWidth = 100;
			layoutGroup.addElement(layoutLabel);
			
			_layoutCheckbox = new CheckBox();
			layoutGroup.addElement(_layoutCheckbox);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_muteToggle.parent["padding"] = getStyle("padding");
			_lockToggle.parent["padding"] = getStyle("padding");
			_webcamCheckbox.parent["padding"] = getStyle("padding");
			_microphoneCheckbox.parent["padding"] = getStyle("padding");
			_publicChatCheckbox.parent["padding"] = getStyle("padding");
			_privateChatCheckbox.parent["padding"] = getStyle("padding");
			_layoutCheckbox.parent["padding"] = getStyle("padding");
		}
	}
}
