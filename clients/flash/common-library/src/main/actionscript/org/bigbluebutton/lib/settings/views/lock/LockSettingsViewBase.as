package org.bigbluebutton.lib.settings.views.lock {
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.VGroup;
	import spark.components.supportClasses.ToggleButtonBase;
	import spark.layouts.VerticalAlign;
	
	public class LockSettingsViewBase extends VGroup {
		
		private var _muteToggle:ToggleButtonBase;
		
		private var _lockToggle:ToggleButtonBase;
		
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
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_muteToggle.parent["padding"] = getStyle("padding");
			_lockToggle.parent["padding"] = getStyle("padding");
		}
	}
}
